# Griffin

## Notes

An MVC framework for the next generation that combines the latest ideas and tools from JS world (React + GraphQL) while trying to keep it somewhat familiar to Rails/Pheonix world (nomenclature, omakase, etc).

## MMVC Architecture

### Data Models

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

### UI Model

- Encapsulate UI state in is a big single immutable map
- Data fetch/send over network APIs (mainly GraphQL)
- Client-side "business logic"

```elixir
defmodule App.WizardApp.UIModel do
  import Griffin.Model

  def state, do: get_state(App.WizardApp.UIModel) || %{
    page: :index,
    wizards: []
  }

  def load_index(auth_token) do
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
    %{state | wizards: wizards, me: me} 
  end

  def follow_wizard(id) do
    %{ favorites } = gql """ {
      update_user(
        id: #{get.me.id}
        auth_token: #{me.auth_token}
        favorites: #{me.favorites ++ %{model: "wizard", model_id: id}}
      ) { favorites }
    } """
    %{state | favorites: me.favorites ++ favorites}
  end
end
```

### Controller

- Quickly converts router `conn`, websocket events, or UI `event` info into model commands
- Delegates data/persistence functionality to model

```elixir
defmodule App.WizardApp.Controller do
  alias App.WizardApp.UIModel, as: Model

  def index(conn, params) do
    auth_token = get_session conn, :auth_token
    state
    |> Model.load_index auth_token
    |> Map.put page: :index
  end

  def follow_wizard(event), do: fn (id) ->
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
  import App.WizardApp.Controller

  def render(model) do
    [:ul@list, 
      for wizard <- model.wizards do
        [:li@item, [
          [:h1@header, "Welcome #{model.name}"],
          [:a@name, [href: "/wizard/#{wizard.id}"], "See #{wizard.name}'s profile >"],
          [:button, [onclick: follow_wizard(wizard.id)], "<3 #{wizard.name}"]]]
      end]
  end
end
```

### Apps

- Root of MMVC app
- Sets up routing, Plug extensions, socket events, composing MMVC parts, and more glue
- Separated by page reloads... (or not b/c enforced stateless?)
- A root "project" combines apps to be passed into Cowboy

```elixir
defmodule App.WizardApp.App do
  import Griffin.App
  alias App.WizardApp.Controller
  alias App.WizardApp.DataModels

  plug Foo

  get "/", Controller.index
  get "/api", graphqlize [DataModels.Wizard]

  on "socket_event", Controller.new_bid

  use App.WizardApp.Views.Root
  use App.WizardApp.UIModel
end

defmodule MyProject do
  import Griffin.Project

  mount App.WizardApp.App
end
```

```
$ iex -S mix
iex> c "path/to/file.ex"
[MyApp]
iex> {:ok, _} = Plug.Adapters.Cowboy.http MyProject, []
{:ok, #PID<...>}
```
