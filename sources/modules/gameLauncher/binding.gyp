{
  "targets": [
    {
      "target_name": "gameLauncher",
      "conditions": [
        ["OS==\"win\"", {
          "sources": [
            "windows/GameLauncher.cpp"
          ]
        }],
        ["OS==\"linux\"", {
          "sources": [
            "linux/GameLauncher.cpp"
          ]
        }]
      ]
    }
  ]
}
