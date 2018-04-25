defmodule MyApp.Controller do
  def events do
    [
      init: &MyApp.ViewModel.on_init(&1),
      add_todo: &MyApp.ViewModel.on_add_todo(&1, &2),
      toggle_finish_todo: &MyApp.ViewModel.on_toggle_finish_todo(&1, &2),
      update_todo_text: &MyApp.ViewModel.on_update_todo_text(&1, &2),
      remove_todo: &MyApp.ViewModel.on_remove_todo(&1, &2)
    ]
  end
end
