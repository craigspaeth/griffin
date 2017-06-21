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

  @doc """
  Converts a Griffin fields DSL into a CRUD map of query/mutation GraphQL
  schemas that can be composed through `graphqlize` and run
  through `GraphQL.execute`.

  ## Parameters

    - namespace: Atom of the model's namespace e.g. :user
    - fields: Keyword List DSL describing the model's fields
    - create: Function for create GraphQL schema resolver
    - read: Function for read GraphQL schema resolver
    - update: Function for update GraphQL schema resolver
    - delete: Function for delete GraphQL schema resolver
    - list: Function for list GraphQL schema resolver
    - returns: String of JSON to be sent to the user


  ## Example

    iex> schema = Griffin.Model.[ |> to_graphql(me: [:string]]
    iex> GraphQL.execute schema, "{ name }"
    {:ok, %{data: %{"name" => "Harry Potter"}}}

  """
  def to_graphql_map(
    namespaces: namespaces,
    fields: fields,
    create: create,
    read: read,
    update: update,
    delete: delete,
    list: list
  ) do
    {singular, plural} = namespaces
    # Read Query
    read_field = %{
      type: %GraphQL.Type.ObjectType{
        name: "#{String.capitalize to_string singular}QueryType",
        fields: fields |> to_graphql(:read)
      },
      resolve: read,
      args: fields |> to_graphql(:read)
    }
    # List Query
    list_field = %{
      type: %GraphQL.Type.List{ofType: %GraphQL.Type.ObjectType{
        name: "#{String.capitalize to_string plural}ListQueryType",
        fields: fields |> to_graphql(:list)
      }},
      resolve: list,
      # resolve: fn(_, args, _) -> [%{name: "Harry"}] end,
      args: fields |> to_graphql(:list)
    }
    # Create Mutation
    create_field = %{
      type: %GraphQL.Type.ObjectType{
        name: "Create#{String.capitalize to_string singular}MutationType",
        fields: fields |> to_graphql(:create)
      },
      resolve: create,
      args: fields |> to_graphql(:create)
    }
    # Delete Mutation
    delete_field = %{
      type: %GraphQL.Type.ObjectType{
        name: "Delete#{String.capitalize to_string singular}MutationType",
        fields: fields |> to_graphql(:delete)
      },
      resolve: delete,
      args: fields |> to_graphql(:delete)
    }
    # Update Mutation
    update_field = %{
      type: %GraphQL.Type.ObjectType{
        name: "Update#{String.capitalize to_string singular}MutationType",
        fields: fields |> to_graphql(:update)
      },
      resolve: update,
      args: fields |> to_graphql(:update)
    }
    # Compose CRUDL schemas into a map of query/mutation GraphQL schemas
    %{
      query: %{
        String.to_atom "#{singular}" => read_field,
        String.to_atom "#{plural}" => list_field
      },
      mutation: %{
        String.to_atom "create_#{singular}" => create_field,
        String.to_atom "update_#{singular}" => update_field,
        String.to_atom "delete_#{singular}" => delete_field
      }
    }
  end

  # Converts a fields dsl into a map of GraphQL types
  defp to_graphql(dsl, crud_op) do
    fields = for {attr, [type | rules]} <- for_crud_op dsl, crud_op do
      graphql_type = cond do
        Enum.member?(rules, :required) ->
          %GraphQL.Type.NonNull{ofType: %GraphQL.Type.String{}}
        type == :string ->
          %GraphQL.Type.String{}
        true ->
          nil
      end
      field = %{
        type: graphql_type
        # TODO:
        # resolve: fn () -> end,
        # description: "",
        # args: %{}
      }
      {attr, field}
    end
    Enum.into fields, %{}
  end
end