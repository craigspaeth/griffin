defmodule Griffin.Model.DSL do
  @moduledoc """
  Module for interacting with the `def fields` part of Griffin models
  """

  @doc """
  Takes a fields DSL with the conditional CRUD fields and outputs a fields DSL
  with the CRUD fields removed or expanded if it matches the CRUD operation.

  ## Example

    iex> dsl = [:string, on_create: :required]
    iex> Griffin.Model.DSL.for_crud dsl, :create
    [:string, :required]
    iex> Griffin.Model.DSL.for_crud dsl, :read
    [:string]

  """
  def for_crud_op(dsl, crud_op) do
    for {attr, [type | rules]} <- dsl do
      new_rules = for {key, rules} <- rules do
        [head | operations] = key |> to_string |> String.split("_")
        is_operation = Enum.member? operations, to_string crud_op
        cond do
          head == "on" and is_operation -> rules
          head != "on" -> {key, rules}
          true -> nil
        end
      end
      new_rules = new_rules |> List.flatten |> List.delete(nil)
      {attr, [type | new_rules]}
    end
  end
end