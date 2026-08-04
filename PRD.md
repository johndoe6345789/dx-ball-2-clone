# Planning Guide

A classic brick-breaking arcade game where players use a paddle to bounce a ball and destroy colorful bricks with power-ups and multiple levels.

**Experience Qualities**:
1. **Energetic** - Fast-paced action with responsive controls and satisfying brick destruction feedback
2. **Rewarding** - Progressive difficulty with power-ups that create exciting gameplay moments
3. **Nostalgic** - Vibrant retro aesthetics that evoke classic arcade gaming memories

**Complexity Level**: Light Application (multiple features with basic state)
- This is a single-player arcade game with game state management, collision detection, power-ups, scoring, and level progression.

## Essential Features

### Paddle Control
- **Functionality**: Player-controlled paddle that moves horizontally along the bottom
- **Purpose**: Core interaction mechanism for keeping the ball in play
- **Trigger**: Mouse movement or arrow keys
- **Progression**: Player moves mouse/keys → Paddle follows horizontally → Ball bounces off paddle
- **Success criteria**: Paddle responds smoothly with no lag, stays within game boundaries

### Ball Physics
- **Functionality**: Ball bounces off walls, paddle, and bricks with realistic physics
- **Purpose**: Primary gameplay mechanic for brick destruction
- **Trigger**: Game start or ball respawn
- **Progression**: Ball launches from paddle → Bounces off surfaces → Destroys bricks on contact → Returns to play
- **Success criteria**: Ball angle changes based on paddle hit position, consistent bounce behavior

### Brick Grid
- **Functionality**: Multi-row grid of destructible bricks with different durability levels
- **Purpose**: Main objective targets that define level completion
- **Trigger**: Level start
- **Progression**: Level loads → Bricks appear in pattern → Ball hits brick → Brick damaged/destroyed → Points awarded
- **Success criteria**: All bricks cleared triggers level completion, collision detection is pixel-perfect

### Power-ups
- **Functionality**: Special items that fall from destroyed bricks providing temporary abilities
- **Purpose**: Add variety and strategic depth to gameplay
- **Trigger**: Random chance when brick is destroyed
- **Progression**: Brick destroyed → Power-up falls → Player catches with paddle → Effect activates
- **Success criteria**: Multiple power-up types (multi-ball, wider paddle, laser, etc.), visual feedback for active effects

### Lives and Scoring
- **Functionality**: Track player lives, score, and current level
- **Purpose**: Core game state that determines success/failure
- **Trigger**: Game start, ball lost, brick destroyed
- **Progression**: Game starts with 3 lives → Ball falls off screen → Life lost → Respawn or game over
- **Success criteria**: Score increases based on brick type, lives displayed clearly, game over screen on 0 lives

### Level Progression
- **Functionality**: Multiple levels with increasing difficulty and brick patterns
- **Purpose**: Provide long-term engagement and challenge escalation
- **Trigger**: All bricks cleared
- **Progression**: Final brick destroyed → Level complete screen → Next level loads with new pattern
- **Success criteria**: At least 5 unique levels with varied layouts, difficulty increases appropriately

## Edge Case Handling

- **Ball Stuck**: If ball gets stuck in repetitive pattern, slight random angle adjustment after 5+ identical bounces
- **Multiple Power-ups**: Active power-up durations tracked independently, visual indicators stack
- **Paddle Edge Hits**: Ball hitting extreme edge of paddle creates sharp angle to prevent boring gameplay
- **Zero Velocity**: If ball somehow stops, automatically relaunch from paddle
- **Rapid Collisions**: Debounce brick collision to prevent double-hits in single frame
- **Pause During Power-up**: Timer pauses for power-up effects when game is paused

## Design Direction

The design should evoke the excitement and energy of 90s arcade games with vibrant neon colors, smooth animations, and a cosmic space theme that feels both retro and polished.

## Color Selection

A bold neon-gradient aesthetic against a deep space background, creating high contrast for gameplay clarity.

- **Primary Color**: Deep Space Blue (oklch(0.2 0.05 250)) - Communicates depth and arcade atmosphere for the main game background
- **Secondary Colors**: 
  - Neon Cyan (oklch(0.75 0.15 200)) - For paddle and UI elements
  - Electric Purple (oklch(0.65 0.2 300)) - For high-value bricks
  - Vibrant Magenta (oklch(0.7 0.25 330)) - For power-ups and special effects
- **Accent Color**: Blazing Orange (oklch(0.75 0.18 45)) - For score highlights, warnings, and active power-up indicators
- **Foreground/Background Pairings**:
  - Deep Space Blue Background (oklch(0.2 0.05 250)): White text (oklch(0.98 0 0)) - Ratio 12.1:1 ✓
  - Neon Cyan (oklch(0.75 0.15 200)): Deep Space Blue text (oklch(0.2 0.05 250)) - Ratio 7.8:1 ✓
  - Blazing Orange (oklch(0.75 0.18 45)): Black text (oklch(0.15 0 0)) - Ratio 8.2:1 ✓

## Font Selection

Typefaces should feel technical and futuristic while maintaining excellent readability for fast-paced gameplay.

- **Typographic Hierarchy**:
  - Game Title: Space Grotesk Bold/48px/tight letter-spacing for strong arcade presence
  - Score/Stats: JetBrains Mono Medium/24px/tabular numbers for consistent digit width
  - UI Labels: Space Grotesk Regular/16px/normal spacing for buttons and menus
  - Level Indicators: Space Grotesk Bold/32px/wide letter-spacing for level transitions

## Animations

Animations should enhance the arcade feel with snappy, energetic movements that provide clear feedback without interfering with gameplay precision.

- Brick destruction: Quick scale-down with particle explosion (150ms)
- Power-up collection: Bright flash with scale pulse (200ms)
- Ball trail: Subtle motion blur effect for speed perception
- Paddle movement: Instant response with slight squash/stretch on ball impact
- Level transition: Fade out with brick cascade animation
- UI elements: Smooth slide-in transitions (300ms ease-out)

## Component Selection

- **Components**:
  - Card: For game container and modal overlays (start screen, game over, level complete)
  - Button: For menu actions (Start Game, Restart, Pause) with neon glow effect on hover
  - Progress: For power-up duration indicators as thin bars below paddle
  - Badge: For displaying active power-up names and multipliers
  - Dialog: For pause menu and settings
  
- **Customizations**:
  - Custom Canvas component for game rendering with 60fps requestAnimationFrame loop
  - Custom brick components with gradient fills matching color tiers
  - Animated particle system for brick explosions using Canvas API
  - Power-up icons using Phosphor icons (Lightning, ArrowsOutSimple, Target, etc.)
  
- **States**:
  - Buttons: Default with border glow, hover with scale(1.05) and brighter glow, active with scale(0.95)
  - Paddle: Default cyan glow, widened state with green tint, laser mode with red edges
  - Ball: Default white with cyan trail, multi-ball with different color trails per ball
  
- **Icon Selection**:
  - Play (filled) for start game
  - Pause (filled) for pause
  - ArrowClockwise for restart
  - Lightning for speed power-up
  - ArrowsOutSimple for wider paddle
  - Target for precision mode
  - Crosshair for laser mode
  
- **Spacing**:
  - Game container: p-6 rounded-xl
  - HUD elements: gap-4 between score/lives/level indicators
  - Menu buttons: gap-3 vertical stacking
  - Modal content: p-8 with gap-6 for internal elements
  
- **Mobile**:
  - Touch controls: Full-width touch area below game canvas for paddle control
  - Simplified particle effects to maintain 60fps on mobile
  - Larger paddle and ball sizes for better visibility
  - Pause button positioned in top-right corner for thumb access
  - Portrait-oriented canvas for better mobile fit
  - Reduced brick columns (6 instead of 10) on narrow screens
