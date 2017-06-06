defmodule Griffin.Validations do
  @moduledoc """
  Library of validation functions and a `valid?/2` function that will
  check a map of GraphQL/JSON-like data passes a series of validations.
  
  Used in the models to enforce a database schema that works for the database
  and exposing to GraphQL.
  """

  @doc """
  Runs `valid?/2` against a certain type of CRUD operation
  
  ## Examples
    iex> schema = [name: [:string, on_create: [:required]]]
    iex> Griffin.Validations.valid? %{ name: nil }, schema, :create
    false
    iex> Griffin.Validations.valid? %{ name: nil }, schema, :read
    true

  """
  def valid?(data, schema, crud_operation) do
    new_schema = for {attr, [type | rules]} <- schema do
      new_rules = for {key, rules} <- rules do
        [head | operations] = key |> to_string |> String.split("_")
        is_operation = Enum.member? operations, to_string crud_operation
        cond do
          head == "on" and is_operation -> rules
          head != "on" -> {key, rules}
          true -> nil
        end
      end
      new_rules = new_rules |> List.flatten |> List.delete(nil) 
      {attr, [type | new_rules]}
    end
    valid? data, new_schema
  end

  @doc """
  Validates a map of json-like data against a schema
  
  ## Parameters

    - data: Map of GraphQL/JSON-like data
    - schema: A DSL of atoms, lists, and functions for validating `data`

  ## Examples

    iex> Griffin.Validations.valid? %{name: "Bob"}, [name: [:string, :required]]
    true

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

            # Single-arg rules like
            # [name: [:string, :required]]
            is_atom rule ->
              rule_name = rule
              apply Griffin.Validations, rule_name, [type, data[attr]]
            
            # Single-arg function like
            # [name: is_caps]
            is_function rule ->
              rule.(type, data[attr])

            # Multi-arg function like
            # [name: [:string, [starts_with_letter "a"]]]
            is_list rule ->
              [func, arg] = rule
              func.(type, data[attr], arg)

            # Multi-arg rules like
            # [name: [:string, min: 10]]
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

  # Validation functions used by valid?/2

  def equals(_, val, ref) do
    val == ref
  end

  def required(_, val) do
    not is_nil val
  end

  def min(type, val, len) when type == :string do
    String.length(val) >= len
  end

  def min(type, val, len) when type == :int do
    val >= len
  end

  def max(type, val, len) when type == :string do
    String.length(val) <= len
  end

  def max(type, val, len) when type == :int do
    val <= len     
  end

  def max(type, val, len) when type == :list do
    Enum.count(val) <= len     
  end

  def of(type, val, schema) when type == :map do
    valid? val, schema
  end

  def of(type, val, schema) when type == :list do
    valids = for item <- val do
      valid? %{item: item}, [item: schema]
    end
    valids |> List.flatten |> Enum.all? 
  end

  def of(type, val, schemas) when type == :either do
    valids = for schema <- schemas do
      valid? %{item: val}, [item: schema]
    end
    valids |> List.flatten |> Enum.any?
  end

  def email(type, val) when type == :string do
    regex = ~r/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/
    if is_nil(Regex.run(regex, val)), do: false, else: true
  end
end
