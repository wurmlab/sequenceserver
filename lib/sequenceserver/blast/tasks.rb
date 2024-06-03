module SequenceServer
  module BLAST
    # Shells out to each blast algorithm to get the help text and then parses it to extract the tasks.
    module Tasks
      ALGORITHMS = %w[blastn blastp blastx tblastn tblastx].freeze

      def self.to_h
        @to_h ||= ALGORITHMS.map do |algorithm|
          help_text = `#{algorithm} -help`
          [algorithm, extract_tasks(help_text)]
        end.to_h
      end

      def self.extract_tasks(help_text)
        lines = help_text.split("\n")

        # Find task help paragraph start
        task_line_index = lines.find_index { |line| line =~ /^\W-task/ }
        return [] unless task_line_index.to_i.positive?

        lines.slice!(0...task_line_index)

        # Find the end of task help paragraph
        next_option_line_index = lines.find_index { |line| line =~ /^\W-/ && !line.include?('-task') }
        lines.slice!(next_option_line_index..-1)

        extract_tasks_from_paragraph(lines)
      end

      def self.extract_tasks_from_paragraph(paragraph_lines)
        as_one_liner = paragraph_lines.map(&:strip).join(' ')
        as_one_liner.split('Permissible values:').last.split('>').first.split(' ').map do |task|
          task.strip.gsub("'", '')
        end.reject(&:empty?)
      end
    end
  end
end
