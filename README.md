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
- [ ] GQL to Keylist request
- --
- [x] Validate
- [x] Pre Middleware
- [x] Peristence
- [x] Post Middleware
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

#### CLI helpers

CLI interface that's Active Record nomeclature `find`, `where`, `create`, `update`, `delete`.

```
Model.find [some: :args] # Mimics GraphQL read query
=> %{ name: "Harry Potter" } # Returns doc/struct
```

### View
- Isomorphic: On the server it outputs a string; On the client it hooks into VirtualDOM/Morphdom
- `state()` is an Agent that references a single immutable map
- Component lifecycle hooks?
- Components + Routes > Views + Controllers?

````elixir
defmodule ArtistView
  import Griffin.View
  import ArtistController.{follow_artist}

  def before_mount() do
    # jQuery thing here
  end

  def styles() do
    %{
      container: %{
        width: "100%"
      },
      header: %{
        text_transform: "uppercase"
      }
    }
  end

  def render() do
    [div: :container,
      [h1: :header, "Artist name:"],
      [p: :name, state.artist.name],
      [button: [onclick: &follow_artist/1],
        "Follow #{state.artist.name"]]
  end
end
````

### Controller

```elixir
defmodule HomeController
  use Griffin.Controller

  def follow_artist(event)
    %{ name: name } = mutate """{
      follow_artist(id: #{state().artist._id}) {
        name
      }
    }
    """
    set_state %{ state | name: name }
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
