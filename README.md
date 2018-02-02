# Griffin

A WIP M²VC framework for Elixir(script) that packages up React and GraphQL in a single cohesive full-stack architecture.

## Getting Started

Test with `mix test.watch` and run with `mix run --no-halt`

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

  def like(id) do
    table("wizards")
    |> get(id)
    |> update(lambda &(%{likes: &1["likes"] + 1}))
    |> run
  end

  def send_welcome_email(ctx) when ctx.operation == :create do
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

View models describe the state of a Griffin app in a single map. View models also contain logic for persistence, state transitions, and functions deriving view-friendly state. When a view model is updated through the `set` function the UI automatically re-renders.

```elixir
defmodule ViewModels.WizardRolodex do
  import Griffin.ViewModel

  @api "http://localhost:3000/api"

  def initial_state, do: %{
    loading: false,
    page: :home,
    wizards: []
  }

  def index_page(ctx) do
    set loading: true
    %{wizards: wizards} = query! @api, """
    wizards(limit: 10) {
      name
      likes
      school
    }
    """
    set loading: false, page: :list, wizards: wizards
  end

  def like_wizard(id) do
    wizards = get :wizards
    wizard = Enum.find id: id
    liked_wizard = %{wizard | likes: wizard.likes + 1}
    set wizards: Enum.reject(wizards) ++ [liked_wizard]
    mutate! @api, """
    like_wizard(id: #{id}) {
      likes
    }
    """
  end

  def on_new_wizard(%{wizards}) do
    set wizards: wizards
  end
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

  def render(model) do
    [:ul@list,
      for wizard <- model.wizards do
        [:li@item, [
          [:p, model.name"],
          [:button, [onclick: [:like, wizard.id]], "Follow"]]]
      end]
  end
end
```

### Controller

Controllers are the central dispatch of a Griffin app. They handle input from users (routes, clicks, keydowns, etc.) and systems (push events, subscriptions, timers, etc.) and delegate corresponding state changes to the view model.

```elixir
defmodule Controllers.WizardRolodex do
  import Griffin.Controller

  get "/wizards", :index_page
  on :like, :like_wizard
  subscribe """
  wizards(sort: "-created_at") {
    name
    likes
    school
  }
  """, :on_new_wizard
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
