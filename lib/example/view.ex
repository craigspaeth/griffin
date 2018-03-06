defmodule MyApp.View do
  import MyApp.Controller.Emitter
  
  def render(model) do
    [:div,
      [
        :ul,
        if length(model.wizards) > 0 do
          for wizard <- model.wizards do
            [:li, "Welcome #{wizard.name}"]
          end
        else
          [:h1, "No wizards"]
        end
      ],
      [:button, [on_click: fn -> emit(:add_wizard) end], "Add wizard"]
    ]
  end
end
