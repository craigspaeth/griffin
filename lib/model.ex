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
        :string,
        :int,
        :float,
        :boolean,
        :object,
        :input_object,
        :non_null,
        :list
      ], type do
        true
      else
        false
      end

      # Check the DSL of the rules following the type passes validation
      rules = Enum.slice validation, 1..-1
      valid_rules = for rule <- rules do
        
        # Single-arg rules like name: [:string, :required]
        if is_atom rule do
          rule_name = rule
          apply Griffin.Validations, rule_name, [data[attr]]
        
        # Multi-arg rules like name: [:string, min: 10]
        else
          rule_name = rule |> Tuple.to_list |> List.first
          rule_args = rule |> Tuple.to_list |> List.last
          apply Griffin.Validations, rule_name, [data[attr], rule_args]
        end
      end
      valid_type and Enum.all? valid_rules
    end
    Enum.all? valids
  end
end
