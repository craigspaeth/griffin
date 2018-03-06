defmodule Griffin.Controller.Client do
  def emitter do
    JS.embed "new EventEmitter()"
  end
end
