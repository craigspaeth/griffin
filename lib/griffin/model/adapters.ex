defmodule Griffin.Model.Adapters do
  @moduledoc """
  Module for storing model database adapters, which are module with CRUDL APIs
  for persisting model operations to a database.
  """

  defmodule Memory do
    @moduledoc """
    Module for storing model data in an in-memory map. Useful for development
    but not production-worthy.
    """

    @doc """
    Starts the agent used to persist the in-memory database.
    """
    def init do
      Agent.start_link fn -> %{} end, name: __MODULE__
    end

    @doc """
    A model resolver to persist a CRUDL operation into a database statement that
    updates the response.
    """
    def to_db_statement(%{errs: errs} = ctx, _) when length(errs) > 0, do: ctx
    def to_db_statement(%{op: op} = ctx) when op == :create do
      doc = insert ctx._model.namespace, ctx.args
      %{ctx | res: doc}
    end

    defp insert(col, doc) do
      Agent.update __MODULE__, fn map ->
        old_col = Map.get map, col
        doc = case {is_nil(old_col), is_nil(doc[:id])} do
          {true, true} -> Map.put doc, :id, 0
          {false, true} -> Map.put doc, :id, length(old_col)
          {_, false} -> doc
        end
        new_col = if old_col, do: map[col] ++ [doc], else: [doc] 
        Map.put map, col, new_col
      end
      Agent.get(__MODULE__, &Map.get(&1, col)) |> List.last
    end

    # defp get(col, id) do
    #   docs = Agent.get __MODULE__, &Map.get(&1, col)
    #   docs
    #   |> Enum.filter(&Map.get(&1, :id) == id)
    #   |> List.first
    # end
  end
end