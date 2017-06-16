defmodule Model do
  @moduledoc false

  import Griffin.Model
  import Griffin.Model.Adapters.Memory

  def namespace, do: :wizard

  def fields, do: [
    name: [:string, :required]
  ]

  def resolve(ctx) do
    ctx
    |> validate(fields())
    |> to_db_statement
  end
end

defmodule ViewModel do
  @moduledoc false

  import Griffin.ViewModel.Server

  def init, do: %{
    wizards: []
  }

  def load_index(model) do
    set model, wizards: [
      %{name: "Harry Potter", meta: %{patronus: "Deer"}},
      %{name: "Snape", meta: %{patronus: "Doe"}}
    ]
  end
end

defmodule View do
  @moduledoc false

  def styles do
    %{
      ul: %{
        list_style: "none"
      },
      item: %{
        font_size: "16px",
        font_family: "Helvetica"
      },
      patronus: %{
        color: "blue"
      }
    }
  end

  def render(model) do
    [:ul@ul,
      for wizard <- model.wizards do
        [:li@item,
          [:h1, "Welcome #{wizard.name}"],
          [:p@patronus, "Patronus: #{wizard.meta.patronus}"]]
      end]
  end
end

defmodule Controller do
  @moduledoc false
end

defmodule Schema do
  @moduledoc false

  def schema do
    %{query: query, mutation: mut} = Griffin.Model.Module.graphqlize [Model]
    %GraphQL.Schema{query: query, mutation: mut}
  end
end

defmodule MyRouter do
  @moduledoc false
  use Plug.Router

  plug :match
  plug :dispatch

  get "/" do
    model = ViewModel.init
    |> ViewModel.load_index
    html = Griffin.View.Server.render View, model
    conn
    |> put_resp_content_type("text/html")
    |> send_resp(200, html)
  end

  match "/api" do
    opts = GraphQL.Plug.init schema: {Schema, :schema}
    GraphQL.Plug.call conn, opts
  end

  match _ do
    send_resp conn, 404, "oops"
  end
end

defmodule MyApp do
  @moduledoc false
  use Application

  def start(_type, _args) do
    Griffin.Model.Adapters.Memory.init
    children = [
      Plug.Adapters.Cowboy.child_spec(:http, MyRouter, [], [port: 4001])
    ]
    opts = [strategy: :one_for_one, name: MyApp.Supervisor]
    IO.puts "Listning on 4001"
    Supervisor.start_link(children, opts)
  end
end