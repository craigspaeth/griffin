defmodule Model do
  import Griffin.Model
  import Griffin.Model.Adapters.Memory

  def namespace, do: {:wizard, :wizards}

  def fields,
    do: [
      name: [:string, :required]
    ]

  def resolve(ctx) do
    ctx
    |> validate(fields())
    |> to_db_statement
  end
end

defmodule Controller do
end

defmodule MyRouter do
  use Plug.Router

  @schema Griffin.Model.GraphQL.schemaify([Model])

  plug(:match)
  plug(:dispatch)

  plug(
    Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json, Absinthe.Plug.Parser],
    pass: ["*/*"],
    json_decoder: Poison
  )

  forward(
    "/graphiql",
    to: Absinthe.Plug.GraphiQL,
    schema: @schema
  )

  forward(
    "/api",
    to: Absinthe.Plug,
    schema: @schema
  )

  get "/" do
    model =
      MyApp.ViewModel.init()
      |> MyApp.ViewModel.load_index()

    html = """
    <html>
      <body>
        <div id="main">#{Griffin.View.Server.render(MyApp.View, model)}</div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react/16.2.0/umd/react.production.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.2.0/umd/react-dom.production.min.js"></script>
        <script>
          window.main = document.getElementById("main");
          #{
            ExScript.Compile.compile!(Enum.join([
              File.read!("lib/griffin/view/react.ex"),
              File.read!("lib/griffin/view/client.ex"),
              File.read!("lib/griffin/view_model/client.ex"),
              File.read!("lib/example/view.ex"),
              File.read!("lib/example/view_model.ex"),
              File.read!("lib/example/client.ex")
            ]))
          }
          ExScript.Modules.ExampleClientApp.start()
        </script>
      </body>
    </html>
    """

    conn
    |> put_resp_content_type("text/html")
    |> send_resp(200, html)
  end

  forward(
    "/assets",
    to: Plug.Static,
    from: "lib/example",
    at: "/",
    only: ["client.js"]
  )

  match _ do
    send_resp(conn, 404, "Page not found")
  end
end

defmodule ExampleServerApp do
  use Application

  def start(_type, _args) do
    Griffin.Model.Adapters.Memory.init()

    children = [
      Plug.Adapters.Cowboy.child_spec(:http, MyRouter, [], port: 4001)
    ]

    opts = [strategy: :one_for_one, name: MyApp.Supervisor]
    IO.puts("Listning on 4001")
    Supervisor.start_link(children, opts)
  end
end
