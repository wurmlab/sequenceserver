#!/bin/bash

EXECUTABLE=$(basename "${0}")
ARGUMENTS=("$@")
BLAST_INSTANCE_ID="i-0793836a2214ab2d3"
BLAST_INSTANCE_ADDRESS="blast.alexion.cloud"
BLAST_IMAGE="ncbi/blast:2.14.0"
BLAST_CONTAINER="blast"
WORK_DIR="/root/.sequenceserver"
LOG_DIR="${WORK_DIR}/log"
TMP_DIR="${WORK_DIR}/tmp"
LOG_FILE="${LOG_DIR}/blast_wrapper.log"



log_wrapper() {
	_date=$(date '+%Y-%m-%d_%H-%M-%S')
	_message="${1}"
	_level=${2:INFO}
	printf '%s [%s] %s\n' "${_date}" "${_level}" "${_message}" >> "${LOG_FILE}"
}


start_blast_instance() {
	log_wrapper "Starting BLAST+ EC2 instance: ${BLAST_INSTANCE_ID}" "DEBUG"
	aws ec2 start-instances --instance-ids "${BLAST_INSTANCE_ID}" 1>>"${LOG_FILE}" 2>&1
	if [[ $? -eq 0 ]]; then
		log_wrapper "Waiting for BLAST+ EC2 instance to be ready" "DEBUG"
		aws ec2 wait instance-status-ok --instance-ids "${BLAST_INSTANCE_ID}" 1>>"${LOG_FILE}" 2>&1
	fi
	return $?
}


run_remote_blast() {
	_executable="${1}"
	log_wrapper "Connecting BLAST+ server: ${BLAST_INSTANCE_ADDRESS}" "INFO"
	log_wrapper "BLAST+ parameters: ${_executable} $(cat """${CMD_FILE}""")" "DEBUG"
	printf '%s' "docker exec ${BLAST_CONTAINER} \"${_executable}\" " > "${REMOTE_SCRIPT_FILE}"
	cat "${CMD_FILE}" >> "${REMOTE_SCRIPT_FILE}"
	ssh -q "${BLAST_INSTANCE_ADDRESS}" '/bin/bash -s' < "${REMOTE_SCRIPT_FILE}"
	return $?
}


main() {
	if [ ! -d "${LOG_DIR}" ]; then mkdir -p "${LOG_DIR}"; fi
	if [ ! -d "${TMP_DIR}" ]; then mkdir -p "${TMP_DIR}"; fi
	CMD_FILE=$(mktemp "${TMP_DIR}/tempfile.XXXXXX")
	REMOTE_SCRIPT_FILE=$(mktemp "${TMP_DIR}/tempfile.XXXXXX")
	log_wrapper "Starting BLAST+ wrapper (${EXECUTABLE})" "INFO"
	for arg in "${ARGUMENTS[@]}"; do
		printf "'%s' " "${arg}" >> "${CMD_FILE}"
	done
	case "${EXECUTABLE}" in
		blast_formatter|blastdbcmd|blastn|blastp|blastx|makeblastdb|tblastn|tblastx )
			log_wrapper "Ensure BLAST EC2 instance is running" "INFO"
			start_blast_instance \
			  && run_remote_blast ${EXECUTABLE};
			;;
		*)
			log_wrapper "Unknown executable name: ${EXECUTABLE}" "ERROR";
			exit 1;
			;;
	esac
}



main
