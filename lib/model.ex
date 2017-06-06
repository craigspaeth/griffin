defmodule Griffin.Model do
  @moduledoc """
  Model library providing validation, database persistence, and
  GrapHQL integration
  """

  @doc """
  Converts a map into a set of CRUD validation rules.
  """
  def fields do
    :hello
  end

  @doc """
  Validates a map of json-like data against a schema returning true/false
  """
  def valid?(data, schema) do
    valids = for {attr, validation} <- schema do

      # Validate the first atom in the DSL is a valid GraphQL type
      type = Enum.at validation, 0
      valid_type = if Enum.member? [
        :int,
        :float,
        :string,
        :boolean,
        :id,
        :map,
        :list,
        :either
        # TODO: Think about how these types might work
        # :interface
        # :enum
      ], type do
        true
      else
        false
      end

      # Check the DSL of the rules following the type passes validation
      rules = Enum.slice validation, 1..-1
      valid_rules = for rule <- rules do
        try do
          cond do

            # Single-arg rules like name: [:string, :required]
            is_atom rule ->
              rule_name = rule
              apply Griffin.Validations, rule_name, [type, data[attr]]
            
            # Function rule like name: [:string, starts_with_letter "a"]
            is_function rule ->
              rule.(data[attr])

            # Multi-arg rules like name: [:string, min: 10]
            true ->
              rule_name = rule |> Tuple.to_list |> List.first
              rule_args = rule |> Tuple.to_list |> Enum.slice(1..-1)
              apply Griffin.Validations, rule_name, [type, data[attr]] ++ rule_args
          end
        rescue
          FunctionClauseError -> false
        end
      end
      valid_type and Enum.all? valid_rules
    end
    Enum.all? valids
  end
end
