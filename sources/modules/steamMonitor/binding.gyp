{
  "targets": [
    {
      "target_name": "steamMonitor",
      "conditions": [
        ["OS==\"windows\"", {
          "sources": [
            "windows/SteamMonitor.cpp"
          ],
          "librairies": [
            "Advapi32.lib"
          ]
        }],
        ["OS==\"linux\"", {
          "sources": [
            "linux/SteamMonitor.cpp"
          ]
        }]
      ]
    }
  ]
}
