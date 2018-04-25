defmodule MyApp.ViewModel do
  import ExScript.Universal
  import Griffin.Controller

  def model(
        state \\ %{
          todos: [],
          todo_text: ""
        }
      ) do
    state
  end

  def on_init(model) do
    model
    |> fetch_todos()
    |> await()
    |> render()
  end

  def on_add_todo(model) do
    model
    |> Map.put(:todos, model.todos ++ [%{text: model.todo_text}])
    |> Map.put(:todo_text, "")
    |> render()
  end

  def on_update_todo_text(model, todo_text) do
    model
    |> Map.put(:todo_text, todo_text)
    |> render()
  end

  def on_remove_todo(model, i) do
    model
    |> Map.put(:todos, List.delete_at(model.todos, i))
    |> render()
  end

  def on_toggle_finish_todo(model, i) do
    todo = Enum.at(model.todos, i)
    new_todo = Map.put(todo, :finished, not todo.finished)
    new_todos = List.replace_at(model.todos, i, new_todo)

    model
    |> Map.put(:todos, new_todos)
    |> render()
  end

  defp fetch_todos(model) do
    res = await(Griffin.HTTP.gql!("http://localhost:4001/api", "{ todos { text } }"))
    Map.merge(model, %{todos: res.todos})
  end
end
