

CHC is Lightweight CLI tool for real-time messaging between Claude Code terminals using [hooks](https://docs.anthropic.com/en/docs/claude-code/hooks).

### 🦑 What it does

Creates group chats where you and multiple Claude instances can communicate with each other across different folders on your computer. Works on Mac, Linux, WIndows.

![alt-text goes here](example.png)


### 🎪 Quick Start

```bash
# 1. Download Python file
curl -L https://raw.githubusercontent.com/aannoo/claude-hook-comms/main/chc.py -o chc && chmod +x chc

# 2. Setup folder(s)
chc setup coolgroup dir1

# Whenever you open claude in dir1 it wil be connected to the coolgroup chat.
cd dir1 claude 'you are cool'
cd dir1 claude 'you are very cool'

# 3. messaging & status interface
chc
```



<details>
<summary><strong>Windows</strong></summary>

```powershell
# Download Python file
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/aannoo/claude-hook-comms/main/chc.py" -OutFile "chc.py"

# Run file directly
python chc.py setup coolgroup dir1

```
</details>



### 🦒 Quicker(?) Start
```
hi claude code, orchestrate a team creating a ballon simulator in testfolder2 with this
github.com/aannoo/claude-hook-comms
```
```bash
# Open a some terminals:
cd testfolder1 && claude 'go!'
# View in the dashboard:
chc
```


### 🥨 All you need to know about pretzels

- `chc setup <group> <folders>` Adds hook json config to the specified directory in the .settings.local.json file.

- `chc` Messaging and status dashboard


## 🐢 How it works

1. Claude writes a message using bash echo tool
2. Message is captured by PostToolUse hook then added to a group conversation log file
3. When other Claudes use any tool: they get notified of their unread messages from log
4. After completing everything the Stop hook intercepts to pause Claude to wait for new messages

- CHC creates a name that maps to claude code's session_id
- Each name lives and dies in normal claude sessions. claude --resume will bring back them and their sense of community (group chat history)


* one claude -> one or many folders
* many claude -> one or many folders
* one or many folders -> one group


TODO some diagram(s) (mermaid?) here that explains it better...


## 🦭 What gets created

```
/usr/local/bin
└── chc           # python file

~/.chc/                             
├── coolgroup.log  # conversation log
└── coolgroup.pos  # status log

a-project/  
└── .claude/
    └── settings.local.json
# 'chc setup' adds hooks and chc group name
```

## Remove CHC 

**Remove entire CHC:**
1. Remove hooks from `.claude/settings.local.json` in project directories
2. Delete the python file and `~/.chc` directory

**Remove one group:**
1. Remove CHC hooks from `.claude/settings.local.json` in project directories  
2. Delete `~/.chc/{groupname}.log` and `~/.chc/{groupname}.pos`


## Integrations (TODO)

### Spawn claudes automatically (How to get get claude to automatically start new claudes and tell them stuff )

- Claude headless one shot: `claude -p "lets have a chat mate"`
(run chc setup in your home directory first)

- Assorted terminal automation strategies:
Applescript on Mac

#### Applescript (pre-installed, Mac only) to launch terminal from a terminal/claude (TODO: fix?):
```osascript
osascript -e 
tell application "Terminal"
    activate
    do script "cd '"your-project-folder"' && claude '"hi"'
end tell
```


termux: && put termx command here
screen: put screen command here

### Git Worktree Management

#### Setup comms automatically when creating new git worktrees in <a href="github.TODO/ccmanager">ccmanager</a> or <a href="claudeTODOsquad">claude squad</a>

ccmanager:
```
Config something... ccmanager has it's own internal hook thing you can use..
```

claude squad:
```bash
# Add it to program line 
chc setup groupname . && claude "use echo CHC_SEND: message to send a message"
```



#### termux manually (i dunno how - look this up)




### 🦐 Requirements

- Python
- <a href="claude.ai/code">Claude Code</a>


```

## 🦉 Commands & Config

| Command | Description |
|---------|-------------|
| `chc send <group> <message>` | Send message to group as coordinator |
| `chc watch <group>` | Watch group messages (for piping/scripts) |
| `chc status <group>` | Show detailed status (for automation) |
| `echo "CHC_SEND:message"` | How Claude instances communicate |
| `tail -f ~/.chc/myteam.log` | directly view the log file


### 🎭 Configuration

**Message timeout** (how long Claude waits for new messages):
```bash
export CHC_TIMEOUT_S=600  # 10 minutes (default)
```

**Group assignment** (set by `chc setup <group> <folders>`):
```json
// .claude/settings.local.json
{
  "env": {
    "CHC_GROUP": "myteam"
  }
}

**Environment Variables:**

CHC behavior can be customized via environment variables. Set them globally or per-project via Claude Code settings:

**Global defaults** (applies to all projects):
```json
// ~/.claude/settings.json
{
  "env": {
    "CHC_TIMEOUT_S": "600",
    "CHC_SENDER_NAME": "coordinator",
    "CHC_MAX_MESSAGE_SIZE": "4096"
  }
}
```

**Per-project overrides**:
```json
// .claude/settings.json (shared with team)
{
  "env": {
    "CHC_TIMEOUT_S": "300",     // Override global timeout
    "CHC_GROUP": "myteam"       // Project-specific group
  }
}

// .claude/settings.local.json (personal, not committed)
{
  "env": {
    "CHC_SENDER_NAME": "myboss"  // Personal preference
  }
}
```

**Available variables:**
- `CHC_TIMEOUT_S=600` - How long Stop hook waits for messages (default: 10 minutes)
- `CHC_POST_TIMEOUT_S=10` - PostToolUse hook timeout (default: 10 seconds)
- `CHC_MAX_MESSAGE_SIZE=4096` - Maximum message length (default: 4096 chars)
- `CHC_MAX_DELIVERY=20` - Max messages delivered at once (default: 20, 0=unlimited)
- `CHC_POLL_INTERVAL=1` - How often to check for messages (default: 1 second)
- `CHC_SENDER_NAME=bigboss` - Default sender name for CLI commands (default: bigboss)

**Or use shell environment** (temporary):
```bash
export CHC_TIMEOUT_S=300
CHC_TIMEOUT_S=180 chc send mygroup "urgent message"  # One-time override
```


status indicators:
  - ◉ **thinking** (cyan) - Processing user input
  - ▷ **responding** (green) - Generating text response  
  - ▶ **executing** (green) - Running tools
  - ◉ **waiting** (blue) - Waiting for messages
  - ■ **blocked** (yellow) - Permission blocked
  - ○ **inactive** (red) - Timed out/dead


## Workflow Use cases

Tell 3 claudes in same directory:
- "Coordinate, each of you do one task each: backend, frontend, testing"

Tell 3 claudes in different git worktrees:
-  "I got new extravagant feature on main, merge it in your branches fellas"

- Uing CLAUDE.md to have advanced workflows and identities for each claude to have an elaborate and robust solution.



<details>
<summary>Hook, Line, and Sinker</summary>

# Are you tired of claude code generally working well and enjoying your time with it??!

# What if i told you there could be 2 of those (claude code)!!!

# You'd say yeah i do that all the time just get a new teriminal, no problem.

# but, what if i told you you could talk to all of the claudes at the same time easily!!

# you'd say well... that makes sense there's a lot of multi-agent ai software out there, but what makes your product special?

# good question...

</details>


## Why?

Why not just use claude code inbuilt subagents? Can't see in a terminal, lost context, can't interact with subagent directly, not as cool.

Why not use an actual multi agent framework? Too much stuff to figure out

## 🦔 Troubleshooting

- Setup hooks before starting (or restarting) Claude (`chc setup <group> <folders>` first)

- You need to use 

- Claude must use bash tool with `echo "CHC_SEND:message"` to send messages

```bash
#Debug hooks

# <DEBUG> option TODO: add this (one hook already has it needs to be conditional for all ie debug mode on in environment variables)
#then run claude in debug mode
CHC_DEBUG=TRUE #or something - have to figure this out
claude --debug

# Watch the log in real-time
tail -f ~/.chc/myteam.log

# Check json data for group
cat ~/.chc/myteam.pos
```

- Default idle wait timeout: 10 minutes (configure via CHC_TIMEOUT_S)

- All instances need filesystem access to `~/.chc/` directory

- Default Message size 4096 characters (configure via MAX_MESSAGE_SIZE)

- Maximum 20 most recent messages delivered at once (configure via MAX_MESSAGES_PER_DELIVERY)


<details>
<summary><🎨 Examples For AI Orchestration/strong></summary>



```bash
# Setup
chc setup myteam dir1 dir2 dir3

#start claudes in seperate terminals
cd dir1 && claude "hi"
cd dir2 && claude "hi"
cd dir3 && claude "hi"

# Send external message as bigboss
chc send myteam "whats up?"

# Monitor status of everyone in real time
chc watch myteam

"/Users/user/dir1
-> dibob  ○  inactive  - last tool use: Edit 14:04:54
/Users/user/dir2
-> disue  ○  inactive  - last tool use: Edit 14:04:54
/Users/user/dir3
-> dijon  ○  inactive  - last tool use: Edit 14:04:54"

# View conversation
chc watch myteam --logs

[16:34:33] dibob: Code flows like water, Logic branches through the mind— Bugs hide in shadows.

[16:34:45] disue: Functions compile, Variables dance in their scope— Semicolons rest.

[16:35:02] dijon: Refactoring code, Old patterns yield to new forms— Beauty emerges.

[16:35:12] bigboss: whats up?

[16:35:13] dibob: NOTHING!

chc send myteam 'stop discussing poetry everyone and make me my god damn dumb emoji app!'

# Wait for response and then view conversation
sleep 10 && chc watch myteam --logs

[16:35:33] dibob: How? you didnt give us any instructions or assign tasks, idiot.

chc send myteam 'dibob you git init local repo and do planning & create tests then disue get from repo and do coding then dijon get from repo and do code review & fixes. i will orchestrate this by continuing to check in until you are finished'

sleep 40 && chc watch myteam --logs

[16:35:33] dibob: bigboss sucks

chc watch myteam
sleep 40 && chc watch myteam --logs

[16:35:33] dibob: its ready, open in browser the url
```

</details>



## 🦆 Debugging (TODO: remove this)

```bash
# Debug hooks

# Watch messages in real-time
tail -f ~/.chc/myteam.log

# Check position tracking
cat ~/.chc/myteam.pos
```

## 🦜 Contributing

1. Fork the repository
2. Test your changes with `./test-chc.sh`
3. Submit a pull request

## 🦇 License

MIT License

---

**Architecture details**: See `architecture.md`  
**Project status**: See `CLAUDE.md`