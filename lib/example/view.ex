defmodule MyApp.View do
  import Griffin.Controller

  def on_submit(e) do
    e.preventDefault.()
    emit(:add_todo)
  end

  def on_update_input(e) do
    emit(:update_todo_text, e.target.value)
  end

  def on_remove_todo(i),
    do: fn _ ->
      emit(:remove_todo, i)
    end

  def on_toggle_finish_todo(i),
    do: fn _ ->
      emit(:toggle_finish_todo, i)
    end

  def render(model) do
    [
      :div,
      [
        :ul,
        if length(model.todos) > 0 do
          for {todo, i} <- Enum.with_index(model.todos) do
            style = %{
              "textDecoration" =>
                if todo.finished do
                  "line-through"
                else
                  ""
                end
            }

            [
              :li,
              [
                [:span, [style: style], todo.text],
                [:button, [on_click: on_toggle_finish_todo(i)], "✔"],
                [:button, [on_click: on_remove_todo(i)], "X"]
              ]
            ]
          end
        else
          [:h1, "No todos"]
        end
      ],
      [
        :form,
        [on_submit: &on_submit/1],
        [
          :input,
          [
            value: model.todo_text,
            on_change: &on_update_input/1,
            place_holder: "foo"
          ]
        ],
        [:button, "Add todo"]
      ],
      [
        :p,
        if model.loading do
          "..."
        else
          ""
        end
      ]
    ]
  end
end
