defmodule Griffin.Model do
  @moduledoc """
  Model library providing validations, database persistence, and
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
    valids = for {key, val} <- schema do

      # Validate the first atom in the DSL is a valid GraphQL type
      type = Enum.at val, 0
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
      validations = val
        |> Enum.slice(1..-1)
        |> Enum.at(0)
      valid_rules = if is_atom validations do
        rule_func = validations
        IO.puts validations
        apply Griffin.Validations, rule_func, [data[key]]
      else
        IO.puts "many validation rules"
        true
    end
      valid_type and valid_rules
    end
    Enum.all? valids
  end
end
