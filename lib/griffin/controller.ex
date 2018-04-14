defmodule Griffin.Controller do
  def emitter do
    if ExScript.Universal.env?(:browser) do
      JS.embed("new EventEmitter()")
    else
      nil
    end
  end

  def emit(emitter, name, args) do
    if ExScript.Universal.env?(:browser) do
      emitter.emit(Atom.to_string(name), args)
    else
      nil
    end
  end

  def on(emitter, name, fun) do
    if ExScript.Universal.env?(:browser) do
      emitter.on(Atom.to_string(name), fun)
    else
      nil
    end
  end
end
