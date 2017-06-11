# Griffin

## Notes

An MVC framework for the next generation that combines the latest ideas and tools from JS world (React + GraphQL) while trying to keep it somewhat familiar to Rails/Pheonix world (nomenclature, omakase, etc).

### Model

- JSON-like data modeling which seamlessly hooks into GraphQL
- CRUD validation support (integrate from Vex/Ecto?)
- Persistance agonstic with adapters

#### Lifecycle of CRUD operation...
- [ ] GQL to Keylist request
- --
- [x] Validate
- [ ] Pre Middleware
- [ ] Peristence
- [ ] Post Middleware
- [ ] Response to Keylist response
- --
- [ ] Convert response to JSON

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

What would be a good interface for persistence lifecycle?

````elixir
defmodule User do
  def resolve(ctx) do # or (struct, params \\ %{})
    ctx
    |> parse_query
    |> cast(fields)
    |> normalize_name
    |> validate(fields)
    |> persist
    |> send_congrats_email
    |> initialize_favorites
    |> response_to_json
  end
end

defmodule User do
  plug :parse_query
  plug :cast
  plug :normalize_name
  plug :validate
  plug :persist
  plug :send_congrats_email
end

defmodule User do
  before_validate on: :all, :parse_query, cast: fields
  before_validate on: [:create], :normalize_name
  after_persist on: [:create] :send_congrats_email
  after_persist on: [:create, :update], :initialize_favorites
  after_persist on: :all, :response_to_json
end
````

#### CLI helpers

CLI interface that's Active Record nomeclature

```
Model.find [some: :args] # Mimics GraphQL read query
=> %{ name: "Harry Potter" } # Returns doc/struct

Model.where [some: :args] # Mimics GraphQL list query
=> %{ name: "Harry Potter" } # Returns doc/struct

Model.create [some: :args] # Mimics GraphQL create mutation
=> %{ name: "Harry Potter" } # Returns doc/struct

Model.update [some: :args] # Mimics GraphQL update mutation
=> %{ name: "Harry Potter" } # Returns doc/struct

Model.destroy [some: :args] # Mimics GraphQL delete mutation
=> %{ name: "Harry Potter" } # Returns doc/struct
```

### View
- Isomorphic: On the server it outputs a string; On the client it hooks into VirtualDOM/Morphdom
- `state()` is an Agent that references a single immutable map
- Component lifecycle hooks?
- Components + Routes > Views + Controllers?

````elixir
defmodule ArtistView
  use Griffin.View

  defp before_mount
    # jQuery thing here
  end

  defp styles
    %{
      container: %{
        width: "100%"
      },
      header: %{
        text_transform: "uppercase"
      }
    }
  end

  def render
    div(:container,
      h1(:header, "Artist name:"),
      p(:name, state().artist.name),
      button(%{ onclick: HomeController.follow_artist },
        "Follow #{state().artist.name"))
  end
end
````

### Controller

```elixir
defmodule HomeController
  use Griffin.Controller

  def follow_artist
    %{ name: name } = mutate """{
      follow_artist(id: #{state().artist._id}) {
        name
      }
    }
    """
    set_state %{ state() | name: name }
  end

  def home
    %{ artists: artists } = query """{
      artists(limit: 10) {
        id
        name
      }
    }
    """
    set_state %{ state() | artists: artists }
    render HomeView
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
