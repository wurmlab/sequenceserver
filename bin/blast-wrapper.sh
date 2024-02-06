#!/bin/bash

EXECUTABLE=$(basename "${0}")
ARGUMENTS=("$@")
BLAST_INSTANCE_ID="i-"
BLAST_INSTANCE_ADDRESS="blast.alexion.cloud"
BLAST_IMAGE="ncbi/blast:2.14.0"
BLAST_CONTAINER="blast"
LOG_FILE="/root/.sequenceserver/log/blast_wrapper.log"
TMP_FILE=$(mktemp ./tempfile.XXXXXX)



log_wrapper() {
	_date=$(date '+%Y-%m-%d_%H-%M-%S')
	_message="${1}"
	_level=${2:INFO}
	printf '%s [%s] %s\n' "${_date}" "${_level}" "${_message}" >> "${LOG_FILE}"
}


start_blast_instance() {
	log_wrapper "Starting BLAST+ EC2 instance: ${BLAST_INSTANCE_ID}" "DEBUG"
	aws ec2 start-instances --instance-ids "${BLAST_INSTANCE_ID}" 1>>"${LOG_FILE}" 2>&1 \
	  && aws ec2 wait instance-status-ok --instance-ids "${BLAST_INSTANCE_ID}" 1>>"${LOG_FILE}" 2>&1
	return $?
}


run_remote_blast() {
	_executable="${1}"
	_remote_script=$(mktemp ./tempfile.XXXXXX)
	# _remote_script="/root/.sequenceserver/log/remote_script.sh"
	log_wrapper "Connecting BLAST+ server: ${BLAST_INSTANCE_ADDRESS}" "DEBUG"
	log_wrapper "BLAST+ parameters: ${_executable} $(cat """${TMP_FILE}""")" "DEBUG"
	printf '%s' "docker exec ${BLAST_CONTAINER} \"${_executable}\" " > "${_remote_script}"
	cat "${TMP_FILE}" >> "${_remote_script}"
	ssh -q "${BLAST_INSTANCE_ADDRESS}" '/bin/bash -s' < "${_remote_script}"
	return $?
}


main() {
	log_wrapper "Starting BLAST+ wrapper (${EXECUTABLE})" "DEBUG"
	for arg in "${ARGUMENTS[@]}"; do
		printf "'%s' " "${arg}" >> "${TMP_FILE}"
	done
	case "${EXECUTABLE}" in
		blast_formatter|blastdbcmd|blastn|blastp|blastx|makeblastdb|tblastn|tblastx )
			# start_blast_instance;
			run_remote_blast ${EXECUTABLE};
			;;
		*)
			log_wrapper "Unknown executable name: ${EXECUTABLE}" "ERROR";
			exit 1;
			;;
	esac
}



main
