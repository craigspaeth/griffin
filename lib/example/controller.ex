defmodule MyApp.Controller do
  @emitter Griffin.Controller.emitter()

  def emit(name, args) do
    Griffin.Controller.emit(@emitter, name, args)
  end

  def on(name, fun) do
    Griffin.Controller.on(@emitter, name, fun)
  end

  def events,
    do: [
      init: &MyApp.ViewModel.on_init(&1),
      add_wizard: &MyApp.ViewModel.on_add_wizard(&1)
    ]
end
