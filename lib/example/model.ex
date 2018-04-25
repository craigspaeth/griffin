defmodule Model do
  import Griffin.Model
  import Griffin.Model.Adapters.Memory

  def namespace, do: {:todo, :todos}

  def fields,
    do: [
      text: [:string, :required]
    ]

  def resolve(ctx) do
    ctx
    |> validate(fields())
    |> to_db_statement
  end
end
