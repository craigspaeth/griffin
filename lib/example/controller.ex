defmodule MyApp.Controller do
  @emitter Griffin.Controller.Client.emitter()

  def emit(name, args) do
    e = @emitter
    e.emit(Atom.to_string(name), args)
  end

  def on(name, fun) do
    e = @emitter
    e.on(Atom.to_string(name), fun)
  end

  def events, do: [
    init: &MyApp.ViewModel.on_init(&1),
    add_wizard: &MyApp.ViewModel.on_add_wizard(&1)
  ]
end
