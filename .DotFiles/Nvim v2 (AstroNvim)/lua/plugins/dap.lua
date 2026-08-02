return {
  {
    "jay-babu/mason-nvim-dap.nvim",
    opts = {
      handlers = {
        function(config)
          require("mason-nvim-dap").default_setup(config)
        end,
      },
    },
  },
  {
    "WhoIsSethDaniel/mason-tool-installer.nvim",
    opts = {
      ensure_installed = { "codelldb" },
    },
  },
}
