defmodule GriffinViewClient do
  def to_react_el(dsl_el) do
    [tag_label | children] = dsl_el
    attrs = if Keyword.keyword? List.first children do
      Enum.reduce List.first(children), %{}, fn ({k, v}, acc) ->
        Map.put acc, Atom.to_string(k), v
      end
    else
      nil
    end
    [_ | childs] = if attrs != nil, do: children, else: [nil] ++ children
    cond do
      is_bitstring List.first childs ->
        text_node tag_label, attrs, List.first childs
      is_list List.first childs ->
        Enum.map List.first(childs), fn (el) -> to_react_el(el) end        
      true ->
        Enum.map childs, fn (el) -> to_react_el(el) end
    end
  end

  def text_node(tag_label, attrs, text) do
    JS.window["React"].createElement(fn (props) ->
      JS.window["React"].createElement(Atom.to_string(tag_label), attrs, text)
    end, %{})
  end

  def render(view, model) do
    el = to_react_el view.render model
    JS.window["ReactDOM"].render el, JS.window["main"]
  end
end
