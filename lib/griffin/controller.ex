defmodule Griffin.Controller do
  @emitter JS.embed("new EventEmitter()")

  def emit(name), do: emit(name, nil)

  def emit(name, args) do
    if ExScript.Universal.env?(:browser) do
      @emitter.emit(Atom.to_string(name), args)
    else
      nil
    end
  end

  def on(name, fun) do
    if ExScript.Universal.env?(:browser) do
      @emitter.on(Atom.to_string(name), fun)
    else
      nil
    end
  end
end
