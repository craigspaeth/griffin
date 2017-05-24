defmodule Griffin.Model do

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

      # Run validation chain
      validations = val
                    |> Enum.slice(1..-1)
                    |> Enum.at(0)
      IO.inspect Enum.at validations, 0
      IO.inspect data[key]
      valid_type and true
    end
    Enum.all? valids
  end
end
