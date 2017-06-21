defmodule Griffin.Model.Module do
  @moduledoc """
  Module for interacting with Griffin models. Griffin models are elixir
  modules that expect certain functions to be defined for the sake of data
  validation, database persistence, and GraphQL integration.
  """

  @doc """
  Gets the singular and plural namespace of a model module.
  """
  def namespaces(model) do
    if is_tuple model.namespace do
      model.namespace
    else
      plural = model.namespace
      |> to_string
      |> Inflectorex.pluralize
      |> String.to_atom
      {model.namespace,  Inflectorex.pluralize("secret")}
    end
  end

  @doc """
  Converts a list of model modules into a single GraphQL schema that
  can be run through `GraphQL.execute`.
  """
  def graphqlize(models) do
    pairs = for model <- models do
      %{query: query, mutation: mutation} = Griffin.Model.DSL.to_graphql_map(
        namespaces: namespaces(model),
        fields: model.fields,
        create: resolver(model, :create),
        read: resolver(model, :read),
        update: resolver(model, :update),
        delete: resolver(model, :delete),
        list: resolver(model, :list)
      )
      {query, mutation}
    end
    base = %{query: %{fields: %{}}, mutation: %{fields: %{}}}
    Enum.reduce pairs, base, fn ({query, mutation}, acc) ->
      %{
        query: %GraphQL.Type.ObjectType{
          name: "RootQueryType",
          fields: Map.merge(acc.query.fields, query)
        },
        mutation: %GraphQL.Type.ObjectType{
          name: "RootMutationType",
          fields: Map.merge(acc.mutation.fields, mutation)
        }
      }
    end
  end

  defp resolver(model, crud_op) do
    fn (_, args, _) -> resolve(model, crud_op, args).res end
  end

  @doc """
  Accepts a model module and passes a `ctx` map through its `resolve`
  function. This `resolve` function is expected to return `ctx` with
  a Poison encodable List or Map in `ctx.res` and/or an errors List in
  `ctx.errors`.

  ```
  defmodule MyModel do
    def resolve(ctx) do
      # Pipe `ctx` through some middleware and return:
      %{
        res: case ctx.op do
          :create -> %{"create": "json"},
          :read -> %{read": "json"},
          :update -> %{update: "json"},
          :delete -> %{delete: "json"},
          :list -> [%{list: "json"}],
        end
      }
    end
  end
  ```

  `ctx` is a map that contains the information of the operation. This map is
  a hetergenous blob of relevant data depending on the operation and context of
  the operation. For instance it can minimally contain `ctx.args` which are the
  arguments to the CRUDL operation and an empty `ctx.res` map and `ctx.errors`
  list expected to be filled in. In the case of an HTTP GraphQL request it may
  contain headers, a logged in user, or a number of other things the user can
  attach to the context by agumenting the map as it pipes through `resolve`.

  This allows a lot of flexibility when composing behavior and passing through
  dependencies. For example, creating a user model may involve validating,
  saving data to the database, sending a confirmation email, and confirming
  that email upon a subsequent update. That might be expressed like so...

  ```
  defmodule User do
    def fields do: [
      email: [:email,
        on_create: :required],
      email_confirmation_hash: [:string, :uuid,
        on_create_read_delete_list: :forbidden]
    ]

    def resolve(ctx) do
      ctx
      |> validate(&fields/0)
      |> confirm_email
      |> to_db_statement
      |> send_confirmation_email
    end
  end
  ```

  One can build on top of this simple foundation for more intricate design
  patterns using various native Elixir techniques like pattern matching, macros,
  better function composing, etc. For instance one could acheive something more
  familiar to Active Recod-style callbacks like so...

   ```
  defmodule User do
    def fields do: ...

    def after_validation(ctx) do: ctx
    def after_validation(ctx) when Enum.member? [:create, :update], ctx.op do
      ctx
      |> set_location
    end

    def before_validation(ctx) do: ctx
    def before_validation(ctx) when ctx.op == :create do
      ctx
      |> normalize_name
    end

    def resolve(ctx) do
      ctx
      |> before_validation
      |> validate(fields)
      |> after_validation
      |> before_save
      |> to_db_statement
      |> after_save
    end
  end
  ```

  Each middleware function here must return `ctx` to be piped through to the
  next eventually returning a `ctx` map to be used for a response.
  """
  def resolve(model, crud_op, args) do
    model.resolve %{
      _model: model,
      args: args,
      res: %{},
      op: crud_op,
      errs: []
    }
  end
end