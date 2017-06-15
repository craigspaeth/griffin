# Griffin

## Notes

An MVC framework for the next generation that combines the latest ideas and tools from JS world (React + GraphQL) while trying to keep it somewhat familiar to Rails/Pheonix world (nomenclature, omakase, etc).

## MVVMC Architecture

### Models

- JSON-like data modeling which seamlessly hooks into GraphQL
- CRUD validation support (integrate from Vex/Ecto?)
- CLI friendly CRUDL functions that skip extra context like auth token
- CLI friendly "business logic" like `[args: %{body: "foo"}, res: %{}] |> Article.extract_tags |> Griffin.Model.to_db_statement`
- Persistance agonstic with adapters

#### Lifecycle of CRUD operation...

- [x] GQL to Keylist request
- --
- [x] Validate
- [x] Pre Middleware
- [x] Peristence
- [x] Post Middleware
- --
- [x] Convert response to JSON

````elixir
defmodule App.WizardApp.DataModels.Wizard do
  import Griffin.DataModel
  import Griffin.Model.Adapters.Memory
  
  def fields(), do: [
    name: [:string, :required],
    school: [:map, of: [
      name: [:string],
      geo: [:map, of: [
        lat: [:int, :required],
        lng: [:int, :required]
      ]]
    ]] 
  ]
  
  def send_weclome_email(ctx), do: ctx
  def send_weclome_email(ctx) when ctx.operation == :create do
    IO.puts "Sending email to #{ctx[:args][:name]}"
    ctx
  end

  def resolve(ctx) do
    ctx
    |> validate(fields)
    |> normalize_name
    |> persist
    |> send_weclome_email
    |> to_response
  end
end
````

#### CLI helpers

CLI interface that's Active Record nomeclature `find`, `where`, `create`, `update`, `delete`.

```
Model.find [some: :args] # Mimics GraphQL read query
=> %{ name: "Harry Potter" } # Returns doc/struct
```

### View Model

- Encapsulate UI state in is a big single immutable map
- Data fetch/send over network APIs (mainly GraphQL)
- Client-side "business logic"
- `set` will trigger updates to an Agent storing the model state (a single agent on the client-side)
- Model functions return the model (from `set`) to 

```elixir
defmodule App.WizardApp.ViewModel do
  import Griffin.Model

  def init, do: %{
    page: :index,
    wizards: []
  }

  def load_index(auth_token) do
    set loading: true
    %{
      wizards: wizards,
      user: me
    } = gql! """ {
      user(auth_token: #{auth_token}) {
        id
        name
        auth_token
        favorites
      }
      wizards(limit: 10) {
        name
        school
      }
    } """
    set loading: false, wizards: wizards, me: me 
  end

  def follow_wizard(id) do
    set loading: true
    %{ favorites } = gql! """ {
      update_user(
        id: #{get.me.id}
        auth_token: #{me.auth_token}
        favorites: #{me.favorites ++ %{model: "wizard", model_id: id}}
      ) { favorites }
    } """
    set loading: false, favorites: me.favorites ++ favorites
  end
end
```

### Controller

- Can be either server/client/shared to handle breadth of input (HTTP/Browser/Routing)
- Takes router info, websocket events, UI events, etc. as input and sends commands to model and/or returns html in shared case
- Delegates data/persistence functionality to model

```elixir
defmodule App.WizardApp.Controller.Shared do
  import Griffin.Controller.Shared
  alias App.WizardApp.ViewModel, as: Model

  def index(conn, params) do
    auth_token = get_session conn, :auth_token
    render conn, Model.load_index auth_token
  end
end

defmodule App.WizardApp.Controller.Server do
  import Griffin.Controller.Server
  alias App.WizardApp.ViewModel, as: Model

  def stream_file(conn, params) do
    stream_file conn, FS.find "file"
  end
end

defmodule App.WizardApp.Controller.Client do
  import Griffin.Controller.Shared
  alias App.WizardApp.ViewModel, as: Model

  def new_bid(event) do
    Model.accept_new_bid event.bid.id
  end

  def follow_wizard(event, id) do
    Model.follow_wizard id
  end
end
```

### Views

- Isomorphic: On the server it outputs a string; On the client it hooks into VirtualDOM/Morphdom/ReactXP
- Views are the output of a single immutable state map
- Component lifecycle hooks?
- A Re-agent like DOM DSL...

```elixir
defmodule App.WizardApp.Views.Wizards do
  def render(model) do
    [:ul@list, 
      for wizard <- model.wizards do
        [:li@item, [
          [:h1@header, "Welcome #{model.name}"],
          [:a@name, [href: "/wizard/#{wizard.id}"], "See #{wizard.name}'s profile >"],
          [:button, [onclick: [:follow_wizard, wizard.id]], "<3 #{wizard.name}"]]]
      end]
  end
  
end
```

### Apps

- Root of MMVC app
- Sets up routing, Plug extensions, socket events, composing MMVC parts, and more glue
- Separated by page reloads... (or not b/c enforced stateless?)
- A root "project" combines apps to be passed into Cowboy

Ideally
```elixir
defmodule App.WizardApp do
  def server, do: App.WizardApp.Server
  def client, do: App.WizardApp.Client
  def shared, do: App.WizardApp.Shared

  get "/api", graphqlize [DataModels.Wizard]
  get "/, render shared.index
  use App.WizardApp.ViewModel
  use App.WizardApp.Views.Root
  on "socket_event", client.new_bid
end
```

Practically
```elixir
defmodule App.WizardApp.Server do
  import Griffin.App.Server
  alias App.WizardApp.DataModels

  plug Foo
  get "/api", graphqlize [DataModels.Wizard]
end

defmodule App.WizardApp.Shared do
  import Griffin.App.Shared
  alias App.WizardApp.Controller

  get "/", render Controller.index
  use App.WizardApp.Views.Root
  use App.WizardApp.ViewModel
end

defmodule App.WizardApp.Client do
  import Griffin.App.Client
  alias App.WizardApp.Controller

  on "socket_event", Controller.new_bid
end

defmodule MyProject do
  import Griffin.Project

  mount App.WizardApp
end
```

```
$ iex -S mix
iex> c "path/to/file.ex"
[MyApp]
iex> {:ok, _} = Plug.Adapters.Cowboy.http MyProject, []
{:ok, #PID<...>}
```
