# Griffin

### Model

- JSON-like data modeling which seamlessly hooks into GraphQL
- CRUD support
- Persistance agonstic

````elixir
defmodule ArtistModel
  use Griffin.Model

  def valid_city

  end

  fields %{
    name: [:string,
      :alphanum,
      [length: [in: 3..30]],
      [on_write: [presence: true]]
    ],
    location: %{
      address: [:string],
      city: [:string, valid_city],
      geo: %{
        lng: [:],
        lat: [:]
      }
    }
  }
end
````

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

### Routes

```elixir
defmodule Router
  use Griffin.Router

  get "/", HomeController.home
end
```

### Apps

- Separated by page reloads... (or not b/c enforced stateless?)
