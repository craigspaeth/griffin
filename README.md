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
  def model do
    attrs = [
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
        create_wizard: [:wizard, attrs, Plugin.crud(:create)],
        update_wizard: [:wizard, attrs, Plugin.crud(:update)],
        delete_wizard: [:wizard, attrs, Plugin.crud(:delete)],
        like_wizard: [:wizard, [id: :id!], &resolve_like_wizard/3]
      ],
      query: [
        wizard: [:wizard, attrs, crud(:read)],
        wizards: [:wizard, attrs, crud(:list)],
      ]
    ]
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
  import Wizards.Controller.Emitter

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

  def on_index_page(state) do
    state
    |> page(:index)
    |> loading
    |> &(emit :render, &1) 
    |> fetch_wizards
    |> loaded
    |> &(emit :render, &1)
  end

  def on_like_wizard(state, id) do
    state
    |> like_wizard(id)
    |> &(emit :render, &1)
    |> like_wizard_mutation(id)
  end

  def on_new_wizards(state, wizards) do
    emit :render, %{state | state.wizards ++ wizards}
  end

  def like_wizard(state, id) do
    wizards = get :wizards
    wizard = Enum.find id: id
    liked_wizard = %{wizard | likes: wizard.likes + 1}
    %{state | wizards: Enum.reject(wizards) ++ [liked_wizard]}
  end

  def like_wizard_mutation(_, id) do
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
    case model.page do
      :home -> [:h1, "Welcome"],
      :list -> Views.WizardList
    end
  end
end
```

```elixir
defmodule Wizards.View.WizardList do
  import Wizards.Controller.Emitter

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
  # TODO: DRY this up with... macro maybe :(
  defmodule Emitter do
    @emitter Griffin.Controller.Emitter.new()
    def emit(k, args), do: @emitter.emit(k, args)
    def on(k, fun), do: @emitter.on(k, fun)
  end

  def init do
    Router.get "/wizards", &emit(:index_page)
    GraphQL.subscribe """
      wizards(sort: "-created_at") {
        name
        likes
        school
      }
    """, &emit(:new_wizards, {&1})

    on :index_page, &ViewModel.on_index_page/1    
    on :new_wizards, &ViewModel.on_new_wizards/2
    on :like, &ViewModel.on_like_wizard/2
  end
end
```

### Apps

A Griffin app glues together the MVC pieces into one Plug middleware.

```elixir
defmodule Wizards do
  import Griffin.App

  def init. do: [
    data_model: Wizards.DataModel,
    view_model: Wizards.ViewModel,
    view: Wizards.View,
    controller Wizards.Controller
  ]
end
```

```
$ iex -S mix
iex> {:ok, _} = Plug.Adapters.Cowboy.http Wizards, []
```
