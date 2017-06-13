# Griffin

## Notes

An MVC framework for the next generation that combines the latest ideas and tools from JS world (React + GraphQL) while trying to keep it somewhat familiar to Rails/Pheonix world (nomenclature, omakase, etc).

### Model

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
defmodule WizardModel do
  import Griffin.Model
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

### V* patterns

Either way we need a component/view concept.

- Isomorphic: On the server it outputs a string; On the client it hooks into VirtualDOM/Morphdom/ReactXP
- Views are the output of a single immutable state map
- Component lifecycle hooks?
- A Re-agent like DOM DSL...

```elixir
wizards = [
  %{id: 0, name: "Harry"},
  %{id: 1, name: "Voldemort"}
]
like_wizard = fn (wiz) ->
  wiz
end
[:ul@list, 
  for wizard <- wizards do
    [:li@item, [
      [:h1@header, "Welcome #{wizard.name}"],
      [:a@name, [href: "/wizard/#{wizard.id}"], "See #{wizard.name}'s profile >"],
      [:button, [onclick: like_wizard], "<3 #{wizard.name}"]]]
  end]
```

Option 1. MMCR: Model (Data), Model (UI), Component, Router
 
The UI model is an isomorphic Elixir(script) module wrapping a single state map. The functions here are kept to data fetching over the network (priarily via GraphQL). The router and component event handlers act as controllers and intermediate steps that handle the icky routing/browser stuff before calling the clean isomorphic model code. Components are ReactXP components coupled to the UI model by default but can easily be made generic by passing in callbacks instead of importing the model.

```elixir
# Router
defmodule Router
  import Griffin.Router

  get "/", do
    Model.set page: :index
  end
end

# UI Model
defmodule Model do
  import Griffin.UIModel

  def follow_artist(id) do
    following = state.following ++ [id]
    set %{ state | following: following }
  end
end

# Root Component
defmodule Components.Root do
  import Griffin.Component

  def els, do: [
    view: Griffin.Component.Els.View
    top_nav: Nav,
    footer: Footer,
    page: case model.page do
      :index -> Index
      :artworks -> Artwork
    end
  ]

  def styles do
    %{
      nav: %{
        width: "100%
      },
      footer: %{},
    }
  end
  
  def render do
    [:view@container, [
      [:top_nav@nav],
      [:page],
      [:footer@footer]
    ]]
  end
end

# Favorites Components
defmodule Components.Favorite do

  def styles do
    %{
      container: %{
        width: "100%
      } 
    }
  end

  def follow_artist(id), do: fn () ->
    Model.follow_artist id
  end

  def render do
    [:div@container,
      for artist <- model.artists do
        [:h1@header, "Artist name:"],
        [:p@name, artist.name],
        [:button [onclick: follow_artist(artist.id)],
          "Follow #{model.artist.name}"]
      end]
  end
end
```

Option 2. MVC: Model, View, Controller

There's only the data model that's sent requests from the controller. The controller holds all event and route handlers. The controller has a single state map that causes re-renders. Routes are hooked up at the app level

```elixir
# App
defmodule App do
  get "/wizards", Controller, :wizards
  get "/wizard/:id", Controller, :wizards
end

# Controller
defmodule Controller
  import Griffin.Router

  def wizards(conn, params) do
    set ${ state | page: :wizards }
    render conn, %{id: params.id}
  end

  def wizards(conn, params) do
    render conn, %{id: params.id}
  end

  def follow(id), do: fn (evt) ->
    following = state.following ++ [id]
    set %{ state | following: following }
  end
end

# Artists View
defmodule Views.Favorites do

  def styles do
    %{
      container: %{
        width: "100%
      } 
    }
  end

  def render(%{artists: artists, follow: follow}) do
    [:div@container,
      for artist <- artists do
        [:h1@header, "Artist name:"],
        [:p@name, artist.name],
        [:button [on_click: follow(artist.id)],
          "Follow #{artist.name}"]
      end]
  end
end
```

### Apps

- Individual Plug apps
- Provides a place for routing/glue
- Separated by page reloads... (or not b/c enforced stateless?)
- A root "project" combines apps to be passed into Cowboy

```elixir
defmodule HomeApp do
  use Griffin.App
  use ArtistModel
  use ArtistView

  get "/", HomeController.home
end

defmodule MyProject do
  use Griffin.Project

  mount HomeApp
end
```

```
$ iex -S mix
iex> c "path/to/file.ex"
[MyApp]
iex> {:ok, _} = Plug.Adapters.Cowboy.http MyProject, []
{:ok, #PID<...>}
```
