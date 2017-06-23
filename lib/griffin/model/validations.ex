defmodule Griffin.Model.Validations do
  @moduledoc """
  Library of validation functions and a `valid?/2` function that will
  check a map of GraphQL/JSON-like data passes a series of validations.

  Used in the models to enforce a database dsl that works for the database
  and exposing to GraphQL.
  """

  @doc """
  Runs `valid?/2` against a certain type of CRUD operation

  ## Examples
    iex> dsl = [name: [:string, on_create: [:required]]]
    iex> Griffin.Validations.valid? %{ name: nil }, dsl, :create
    false
    iex> Griffin.Model.Validations.valid? %{ name: nil }, dsl, :read
    true

  """
  def valid?(data, dsl, crud_op) do
    new_dsl = Griffin.Model.DSL.for_crud_op dsl, crud_op
    valid? data, new_dsl
  end

  @doc """
  Returns true/false if there are any error tuples returned from `&errors/2`
  """
  def valid?(data, dsl) do
    Enum.empty? errors data, dsl
  end

  @doc """
  Pulls the error tuples out of &results/2
  """
  def errors(data, dsl) do
    Enum.filter results(data, dsl), fn {status, _} -> status == :error end
  end

  @doc """
  Validates a map of json-like data against a dsl returning results in a list of
  tuples containing ok/errors e.g.

  ```
  [{:ok, :name},{:error, :password, "fails min: 4"}].
  ```

  ## Parameters

    - data: Map of GraphQL/JSON-like data
    - dsl: A DSL of atoms, lists, and functions for validating `data`

  ## Examples

    iex> Griffin.Model.Validations.valid?(
           %{name: "Bob"},
           [name: [:string, :required]]
         )
    true

  """
  def results(data, dsl) do
    res = for {attr, validation} <- dsl do

      # Validate the first atom in the DSL is a valid Elixir/GraphQLey type
      type = Enum.at validation, 0
      types = [
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
      ]
      valid_type = if Enum.member? types, type do
        {:ok, attr}
      else
        {:error, "Type #{type} must be one of #{types}"}
      end

      # Check the DSL of the rules following the type passes validation
      rules = Enum.slice validation, 1..-1
      valid_rules = for rule <- rules do
        try do
          is_valid = cond do

            # Zero airity rules like
            # [name: [:string, :required]]
            is_atom rule ->
              rule_name = rule
              apply Griffin.Model.Validations, rule_name, [type, data[attr]]

            # Zero arity function like
            # [name: [:string, &is_caps/0]]
            is_function rule ->
              rule.(type, data[attr])

            # Single airity function like
            # [name: [:string, [starts_with_letter "a"]]]
            is_list rule ->
              [func, arg] = rule
              func.(type, data[attr], arg)

            # Single Keylist pair airty rules like
            # [name: [:string, min: 10]]
            is_tuple rule ->
              rule_name = rule |> Tuple.to_list |> List.first
              rule_args = rule |> Tuple.to_list |> Enum.slice(1..-1)
              apply(
                Griffin.Model.Validations,
                rule_name,
                [type, data[attr]] ++ rule_args
              )

            # Unsupported style
          end
          if is_valid do
            {:ok, attr}
          else
            msg =
              "#{attr} with value #{inspect data[attr]} " <>
              "is invalid according to the rule #{inspect rule}"
            {:error, msg}
          end
        rescue
          FunctionClauseError -> {:error, "#{attr} missing validation function"}
        end
      end
      [valid_type] ++ valid_rules
    end
    List.flatten res
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

  def of(type, val, dsl) when type == :map do
    valid? val, dsl
  end

  def of(type, val, dsl) when type == :list do
    valids = for item <- val do
      valid? %{item: item}, [item: dsl]
    end
    valids |> List.flatten |> Enum.all?
  end

  def of(type, val, dsls) when type == :either do
    valids = for dsl <- dsls do
      valid? %{item: val}, [item: dsl]
    end
    valids |> List.flatten |> Enum.any?
  end

  def email(type, val) when type == :string do
    regex = ~r/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/
    if is_nil(Regex.run(regex, val)), do: false, else: true
  end
end
