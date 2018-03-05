# Griffin

A WIP M²VC framework for Elixir(script) that packages up React and GraphQL in a single cohesive full-stack architecture.

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

## M²VC Architecture

### Model (Data)

Griffin models are split into two parts—data models and view models. Data models describe and validate the shape of data stored in your database, the business logic related to that shape of data, and the external operations possible on that data exposed via GraphQL.

````elixir
defmodule DataModels.Wizard do
  import Griffin.DataModel
  import Griffin.DataModel.Adapters.RethinkDB

  def fields, do: [
    name: [:string, :required],
    school: [:map, of: [
      name: [:string],
      banner: [:string]
    ]]
  ]

  @tag :mutation
  def like(id) do
    table("wizards")
    |> get(id)
    |> update(lambda &(%{likes: &1["likes"] + 1}))
    |> run
  end

  defp send_welcome_email(ctx) when ctx.operation == :create do
    SendGrid.Mailer.send "Welcome #{ctx[:args][:name]}"
    ctx
  end

  def resolve(ctx) do
    ctx
    |> validate(fields)
    |> to_db_statement(table: "wizards")
    |> send_welcome_email
  end
end
````

### Model (View)

View models encapsulate state, and state changes, of a Griffin app. View models hold state in a single map, define pipelines for state transitions, and expand state into a view-friendly model with `model`. Passing a state map to `update` will cause the UI to re-render with the expanded model passed into views.

```elixir
defmodule ViewModels.WizardRolodex do
  import Griffin.ViewModel

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
    |> update
    |> fetch_wizards
    |> loaded
    |> update
  end

  def on_like_wizard(state, id) do
    state
    |> like_wizard(id)
    |> update
    |> like_wizard_mutation(id)
  end

  def on_new_wizards(state, wizards) do
    update %{state | state.wizards ++ wizards}
  end

  def like_wizard(state, id) do
    wizards = get :wizards
    wizard = Enum.find id: id
    liked_wizard = %{wizard | likes: wizard.likes + 1}
    %{state | wizards: Enum.reject(wizards) ++ [liked_wizard]}
  end

  def like_wizard_mutation(_, id) do
    mutate! @api, """
      like_wizard(id: #{id}) {
        likes
      }
    """
  end

  def page(state, page), do: %{state | page: page}

  def loading(state), do: %{state | loading: true}

  def fetch_wizards(state) do
    %{wizards: wizards} = await query! @api, """
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
defmodule Views.WizardRolodex do
  def render(model) do
    case model.page do
      :home -> [:h1, "Welcome"],
      :list -> Views.WizardList
    end
  end
end
```

```elixir
defmodule Views.WizardList do
  def styles, do: [
    list: [
      list_style: "none"
    ],
    item: [
      padding: "20px"
    ]
  ]

  def like_wizard(emit, id), do: fn (_) ->
    emit(:like, id)
  end

  def render(model, emit) do
    [:ul@list,
      for wizard <- model.wizards do
        [:li@item, [
          [:p, wizard.name"],
          [:button, [on_click: like_wizard(emit, id)], "Follow"]]]
      end]
  end
end
```

### Controller

Controllers are the central glue point, and event emitter, of a Griffin app. They handle input from users (routes, clicks, keydowns, etc.) and systems (push events, subscriptions, timers, etc.) and delegate corresponding state changes to the view model.

```elixir
defmodule Controllers.WizardRolodex do
  import Griffin.Controller

  def init do
    Router.get "/wizards", &emit(:index_page)
    on :index_page, &ViewModel.on_index_page/1,
  end

  def init_browser do
    GraphQL.subscribe """
      wizards(sort: "-created_at") {
        name
        likes
        school
      }
    """, &emit(:new_wizards, &1)
    on :like, &ViewModel.on_like_wizard/2,
    on :new_wizards, &ViewModel.on_new_wizards/2
  end
end
```

### Apps

A Griffin app glues together the M²VC pieces into one Plug middleware.

```elixir
defmodule Apps.WizardRolodex do
  import Griffin.App

  data_models [DataModels.Wizard]
  view_model ViewModels.WizardRolodex
  view Views.WizardRolodex
  controller Controllers.WizardRolodex
end
```

```
$ iex -S mix
iex> {:ok, _} = Plug.Adapters.Cowboy.http Apps.WizardRolodex, []
```
