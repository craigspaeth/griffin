defmodule MyApp.Controller.Emitter do
  def emit(k), do: IO.puts "emitted #{k}"
end
