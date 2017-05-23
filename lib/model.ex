defmodule Griffin.Model do

  @doc """
  Converts a map into a set of CRUD validation rules.
  """
  def fields do
    :hello
  end

  @doc """
  Validates a map of fields against a schema returning true/false
  """
  def validate(fields, schema) do
    valids = for {key, val} <- schema do

      # Validate against GraphQL types
      type = Enum.at val, 0
      valid_type = cond do
        Enum.member? [
          :string,
          :int,
          :float,
          :boolean,
          :object,
          :input_object,
          :non_null,
          :list
        ] , type -> true
        true -> false
      end

      # Run extra validations through Vex
      validations = val
                    |> Enum.slice(1..-1)
                    |> Enum.at(0)
      passed_vex = Vex.valid? fields, [{key, validations}]
      valid_type and passed_vex
    end
    Enum.all? valids
  end
end
