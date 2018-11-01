{
  "targets": [
    {
      "target_name": "gameLauncher",
      "conditions": [
        ["OS==\"win\"", {
          "sources": [
            "srcs/windows/GameLauncher.cpp"
          ]
        }],
        ["OS==\"linux\"", {
          "sources": [
            "srcs/linux/GameLauncher.cpp"
          ]
        }]
      ]
    }
  ]
}
