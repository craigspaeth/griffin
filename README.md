# Griffin

A WIP MVC framework for Elixir(script) that packages up React and GraphQL in a single minimalistic full-stack architecture.

## Getting Started

Test with `mix test.watch` and run with `mix run --no-halt`

Seed data with GraphQL

```
curl \
  -X POST \
  -H "Content-Type: application/graphql" \
  --data 'mutation { create_wizard(name: "Harry") { name } }' \
  http://localhost:4001/api
```

## MVC Architecture

### Model (Data)

Griffin models are split into two parts—data models and view models. Data models describe GraphQL schemas by returning a DSL from `model`. Validation and persistence to the database can be composed from resolve functions.

````elixir
defmodule Wizards.DataModel do
  import RethinkDB.Query

  def model do
    args = [
      name: :string!,
      school: :school
    ]
    [
      types: [
        wizard: [
          id: :id!
        ] ++ attrs,
        school: [
          name: :string,
          banner: :string
        ]
      ],
      mutation: [
        create_wizard: [args, :wizard, resolve_crud(:create)],
        update_wizard: [args, :wizard, resolve_crud(:update)],
        delete_wizard: [args ,:wizard, resolve_crud(:delete)],
        like_wizard: [[id: :id!], :wizard, &resolve_like_wizard/3]
      ],
      query: [
        wizard: [args, :wizard, resolve_crud(:read)],
        wizards: [args, :wizard, resolve_crud(:list)],
      ]
    ]
  end

  def resolve_crud(method) when method == :create, do: &(create &1)

  def create(wizard) do
    table("wizards")
    |> insert(wizard)
    |> run
  end

  def resolve_like_wizard(args, _, _), do: like args.id

  def like(id) do
    table("wizards")
    |> get(id)
    |> update(lambda &(%{likes: &1["likes"] + 1}))
    |> run
  end
end
````

### Model (View)

View models encapsulate state, and state changes, of a Griffin app. View models hold state in a single map, define pipelines for state transitions, and expand state into a view-friendly model with `model`.

```elixir
defmodule Wizards.ViewModel do
  import Griffin.Controller

  @api "http://localhost:3000/api"

  def model(state = %{
    loading: false,
    page: :home,
    wizards: []
  }) do
    %{
      state |
      wizard_names: wizard_names(state)
    }
  end

  def on_index_page(state, _) when state.page == :index, do: state
  def on_index_page(state, ctx) do
    state
    |> page(:index)
    |> loading()
    |> render()
    |> fetch_wizards()
    |> loaded()
    |> render()
  end

  def on_like_wizard(state, id) do
    state
    |> like_wizard(id)
    |> render()
    |> update_liked_wizard(id)
  end

  def on_new_wizards(state, wizards) do
    render %{state | state.wizards ++ wizards}
  end

  def on_404(state) do
    state
    |> page(:"404")
    |> render()
  end

  def update_liked_wizard(_, id) do
    GraphQL.mutate! @api, """
      like_wizard(id: #{id}) {
        likes
      }
    """
  end

  def page(state, page), do: %{state | page: page}

  def loading(state), do: %{state | loading: true}

  def fetch_wizards(state) do
    %{wizards: wizards} = await GraphQL.query! @api, """
    wizards(limit: 10) {
      name
      likes
      school
    }
    """
    %{state | wizards: wizards}
  end

  def loaded(state), do: %{state | loaded: false}

  def wizard_names(state), do: Enum.map state.wizards, &(&1.name)
end
```

### Views

Views describe the markup, styling, and event handlers of the UI. They are the output of a view model and render on the server and client using React.

```elixir
defmodule Wizards.View do
  def render(model) do
    [:html,
      [:body,
        [:main,
          case model.page do
            :home -> [:h1, "Welcome"],
            :index -> Wizars.View.Index
          end],
        [:griffin_script],
        [:script, "window.initialState = #{Poison.stringify(model)}"]]]
  end
end
```

```elixir
defmodule Wizards.View.Index do
  import Griffin.Controller

  def render(model) do
    [:ul,
      for wizard <- model.wizards do
        [:li, [
          [:p, wizard.name"],
          [:button, [on_click: fn -> emit(:like, {id}) end], "Follow"]]]
      end]
  end
end
```

### Controller

Controllers are a central event emitter. They subscribe to input from users (routes, clicks, keydowns, etc.) and systems (push events, subscriptions, timers, etc.), delegate state changes to the view model, and trigger re-renders.

```elixir
defmodule Wizards.Controller do
  import Wizards.ViewModel
  import Griffin.Controller

  def events, do: [
    new_wizards: &on_new_wizards/2,
    like: &on_like_wizard/2,
    route: &on_route/2,
    dom_ready: &on_dom_ready/1
  ]

  def on_route(state, ctx) do
    case ctx.url do
      "/wizards" -> on_index_page(state, ctx)
      _ -> on_404(state, ctx)
    end
  end

  def on_dom_ready(state) do
    GraphQL.subscribe """
      wizards(sort: "-created_at") {
        name
        likes
        school
      }
    """, &emit(:new_wizards, {&1})
    %{state | JS.global().initialState}
  end
end
```

### Plug middleware

Finally, compose all of the pieces into one plug middleware. This can be used liberally to compose many apps together. e.g.

- apps
  - user
    - data_model
    - view_model
    - view
    - controller
  - api
    - data_model
-

```

$ iex -S mix
iex> {:ok, _} = Plug.Adapters.Cowboy.http Griffin.to_plug([
  data_model: Wizards.DataModel,
  view_model: Wizards.ViewModel,
  view: Wizards.View,
  controller Wizards.Controller
]), []
```
