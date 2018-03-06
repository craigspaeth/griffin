defmodule MyApp.Controller.Emitter do
  def emit(k), do: IO.puts "emitted #{Atom.to_string k}"
end
