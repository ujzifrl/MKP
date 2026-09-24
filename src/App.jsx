import React from "react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

const tracks = [
  { name: "bleed", id: "T7Z-VdEUdcY" },
  { name: "misery", id: "TYy6BlUVhPU" },
  { name: "Tower of memories", id: "OuNG2WeWdoA" }
];

const roster = [
  ["Grim", "Founder"],
  ["Vanish", "Owner"],
  ["Rarey", "Editor"],
  ["Fever", "Member"],
  ["Conjuring", "Member"],
  ["Rico", "Member"],
  ["Kardie", "Member"],
  ["Deadslams", "Member"],
  ["Ashes", "Member"]
];

const ADMIN_ROLES = ["admin", "Founder", "Owner", "Editor"];

function Layout({ children, session, role }) {
  const [musicOpen, setMusicOpen] = useState(false);
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    navigate("/");
  }

  const canAccessAdmin = session && ADMIN_ROLES.includes(role);

  return (
  <div className="site-shell">
    <div className="scanlines"></div>

    <div className="particles">
      {Array.from({ length: 34 }).map((_, i) => {
        return <span key={i} className={"particle p" + i}></span>;
      })}
    </div>

      <header className="navbar">
        <NavLink to="/" className="brand glitch" data-text="MKP">
          MKP
        </NavLink>

        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/add-paste">Add Paste</NavLink>
          <NavLink to="/pastes">Pastes</NavLink>
          <NavLink to="/users">Users</NavLink>

          {canAccessAdmin && (
            <NavLink to="/admin">Admin Panel</NavLink>
          )}

          <NavLink to="/roster">MKP Roster 2026</NavLink>
          <NavLink to="/terms">TOS</NavLink>
          <NavLink to="/support">Support</NavLink>
        </nav>

        <div className="nav-account">
          {session ? (
            <button className="ghost-btn" onClick={logout}>
              Logout
            </button>
          ) : (
            <button
              className="ghost-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </div>
      </header>

      <main className="page">
        <div className="route-glitch" key={location.pathname}>
          {children}
        </div>
      </main>

      <button
        className="music-toggle"
        onClick={() => setMusicOpen(v => !v)}
      >
        {musicOpen ? "×" : "♫"}
      </button>

      {musicOpen && (
        <MusicPlayer
          tracks={tracks}
          track={track}
          setTrack={setTrack}
          playing={playing}
          setPlaying={setPlaying}
        />
      )}
    </div>
  );
}

function MusicPlayer({ tracks, track, setTrack, playing, setPlaying }) {
  const [volume, setVolume] = useState(55);
  const playerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const current = tracks[track];

  useEffect(() => {
    let cancelled = false;

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const previous = window.onYouTubeIframeAPIReady;

        window.onYouTubeIframeAPIReady = () => {
          if (previous) previous();
          resolve();
        };

        if (
          !document.querySelector(
            'script[src="https://www.youtube.com/iframe_api"]'
          )
        ) {
          const script = document.createElement("script");
          script.src = "https://www.youtube.com/iframe_api";
          script.async = true;
          document.head.appendChild(script);
        }
      });
    };

    loadYouTubeAPI().then(() => {
      if (cancelled || !playerRef.current) return;

      if (!ytPlayerRef.current) {
        ytPlayerRef.current = new window.YT.Player(
          playerRef.current,
          {
            videoId: current.id,
            playerVars: {
              autoplay: 0,
              controls: 1,
              rel: 0,
              modestbranding: 1
            },
            events: {
              onReady: (event) => {
                event.target.setVolume(volume);
              },

              onStateChange: (event) => {
                if (
                  event.data ===
                  window.YT.PlayerState.PLAYING
                ) {
                  setPlaying(true);
                }

                if (
                  event.data ===
                    window.YT.PlayerState.PAUSED ||
                  event.data ===
                    window.YT.PlayerState.ENDED
                ) {
                  setPlaying(false);
                }
              }
            }
          }
        );
      } else {
        ytPlayerRef.current.loadVideoById(current.id);
        ytPlayerRef.current.setVolume(volume);

        if (playing) {
          ytPlayerRef.current.playVideo();
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [track]);

  useEffect(() => {
    const player = ytPlayerRef.current;

    if (!player || typeof player.setVolume !== "function") {
      return;
    }

    player.setVolume(Number(volume));
  }, [volume]);

  useEffect(() => {
    const player = ytPlayerRef.current;

    if (!player) return;

    if (playing) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [playing]);

  function selectTrack(index) {
    setTrack(index);
    setPlaying(true);
  }

  return (
    <aside className="music-player">
      <div className="music-title">MKP MUSIC</div>

      <div className="youtube-player">
        <div ref={playerRef} />
      </div>

      <div className="music-track">
        <div>
          <small>NOW PLAYING</small>
          <strong>{current.name}</strong>
        </div>

        <button
          className="play-btn"
          onClick={() => setPlaying(v => !v)}
        >
          {playing ? "Ⅱ" : "▶"}
        </button>
      </div>

      <div className="track-list">
        {tracks.map((item, i) => (
          <button
            key={item.id}
            className={i === track ? "track active" : "track"}
            onClick={() => selectTrack(i)}
          >
            <span>{i === track && playing ? "●" : "○"}</span>
            {item.name}
          </button>
        ))}
      </div>

      <label className="volume">
        VOL

        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
        />

        <span>{volume}%</span>
      </label>

      <div className="music-note">
        Powered by the official YouTube embedded player.
      </div>
    </aside>
  );
}

function Home({ session }) {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">MKP // SYSTEM ONLINE</div>

        <h1 className="glitch hero-title" data-text="MKP">
          MKP
        </h1>

        <p className="hero-subtitle">
          A public place to share information, files, and pastes.
        </p>

        <div className="auth-card">
          <div className="card-label">ACCESS PORTAL</div>

          <h2>
            {session ? "Welcome back." : "Enter MKP."}
          </h2>

          <p>
            {session
              ? "Your account is active. Create a paste or browse public content."
              : "Log in or create an account to start posting."}
          </p>

          <div className="button-row">
            {session ? (
              <>
                <button
                  className="primary-btn"
                  onClick={() => navigate("/add-paste")}
                >
                  ADD PASTE
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => navigate("/pastes")}
                >
                  VIEW PASTES
                </button>
              </>
            ) : (
              <>
                <button
                  className="primary-btn"
                  onClick={() => navigate("/login")}
                >
                  LOGIN
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => navigate("/register")}
                >
                  CREATE ACCOUNT
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="hero-side">
        <div className="terminal">
          <div className="terminal-top">
            <span>MKP://HOME</span>
            <span>● ● ●</span>
          </div>

          <div className="terminal-body">
            <p><span className="red">[OK]</span> NETWORK ONLINE</p>
            <p><span className="red">[OK]</span> PASTE SYSTEM READY</p>
            <p><span className="red">[OK]</span> AUTH MODULE READY</p>
            <p><span className="red">[OK]</span> GLITCH ENGINE ACTIVE</p>
            <p className="cursor">_</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();

    if (!supabase) {
      return setMessage(
        "Supabase is not configured yet. Follow SETUP.md."
      );
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password
    });

    if (error) return setMessage(error.message);

    navigate("/");
  }

  return (
    <AuthPage
      title="LOGIN"
      subtitle="Access your MKP account."
    >
      <form onSubmit={submit} className="form">
        <label>
          Username Or Email

          <input
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="username or email"
            required
          />
        </label>

        <label>
          Password

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="password"
            required
          />
        </label>

        <button
          className="primary-btn full"
          type="submit"
        >
          LOGIN
        </button>

        {message && (
          <div className="form-message">
            {message}
          </div>
        )}

        <button
          className="link-btn"
          type="button"
          onClick={() => navigate("/register")}
        >
          Create an account
        </button>
      </form>
    </AuthPage>
  );
}

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: ""
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();

    if (form.password !== form.confirm) {
      return setMessage("Passwords do not match.");
    }

    if (form.password.length < 8) {
      return setMessage(
        "Password must be at least 8 characters."
      );
    }

    if (!supabase) {
      return setMessage(
        "Supabase is not configured yet. Follow SETUP.md."
      );
    }

    const { data, error } =
      await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username
          }
        }
      });

    if (error) return setMessage(error.message);

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        username: form.username
      });
    }

    setMessage(
      "Account created. Check your email to verify your account, then log in and accept the TOS."
    );
  }

  return (
    <AuthPage
      title="CREATE ACCOUNT"
      subtitle="Make your MKP account."
    >
      <form onSubmit={submit} className="form">
        <label>
          Username

          <input
            value={form.username}
            onChange={e =>
              setForm({
                ...form,
                username: e.target.value
              })
            }
            required
          />
        </label>

        <label>
          Email

          <input
            type="email"
            value={form.email}
            onChange={e =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
            required
          />
        </label>

        <label>
          Password

          <input
            type="password"
            value={form.password}
            onChange={e =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
            required
          />
        </label>

        <label>
          Confirm Password

          <input
            type="password"
            value={form.confirm}
            onChange={e =>
              setForm({
                ...form,
                confirm: e.target.value
              })
            }
            required
          />
        </label>

        <button
          className="primary-btn full"
          type="submit"
        >
          CREATE ACCOUNT
        </button>

        {message && (
          <div className="form-message">
            {message}
          </div>
        )}
      </form>
    </AuthPage>
  );
}

function AuthPage({ title, subtitle, children }) {
  return (
    <section className="center-page">
      <div className="auth-panel">
        <div className="eyebrow">MKP // AUTH</div>

        <h1 className="glitch" data-text={title}>
          {title}
        </h1>

        <p>{subtitle}</p>

        {children}
      </div>
    </section>
  );
}

function AddPaste({ session }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();

    if (!session) {
      return setMessage(
        "You must be logged in to add a paste."
      );
    }

    if (!supabase) {
      return setMessage(
        "Supabase is not configured yet. Follow SETUP.md."
      );
    }

    if (!file) {
      return setMessage("Choose a file first.");
    }

    setMessage("Preparing upload...");

    const safeName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

   const path =
  session.user.id + "/" + crypto.randomUUID() + "-" + safeName;

    const { error: uploadError } =
      await supabase.storage
        .from("pastes")
        .upload(path, file);

    if (uploadError) {
      return setMessage(uploadError.message);
    }

    const { error } =
      await supabase.from("pastes").insert({
        user_id: session.user.id,
        title,
        description,
        visibility,
        file_path: path
      });

    if (error) {
      return setMessage(error.message);
    }

    setTitle("");
    setDescription("");
    setFile(null);

    setMessage(
      "Paste published successfully."
    );
  }

  return (
    <section className="content-page">
      <PageHeading
        eyebrow="MKP // PUBLISH"
        title="ADD PASTE"
        subtitle="Upload a file and decide who can see it."
      />

      <div className="panel narrow">
        <form className="form" onSubmit={submit}>
          <label>
            Title

            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </label>

          <label>
            Description

            <textarea
              value={description}
              onChange={e =>
                setDescription(e.target.value)
              }
              rows="5"
            />
          </label>

          <label>
            Upload File

            <input
              type="file"
              onChange={e =>
                setFile(
                  e.target.files?.[0] || null
                )
              }
              required
            />
          </label>

          <label>
            Visibility

            <select
              value={visibility}
              onChange={e =>
                setVisibility(e.target.value)
              }
            >
              <option value="public">
                Public
              </option>

              <option value="private">
                Private
              </option>
            </select>
          </label>

          <button
            className="primary-btn full"
            type="submit"
          >
            PUBLISH PASTE
          </button>

          {message && (
            <div className="form-message">
              {message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

function Pastes({ session }) {
  const [pastes, setPastes] = useState([]);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function load() {
      if (!supabase) {
        return setMessage(
          "Supabase is not configured yet. Follow SETUP.md."
        );
      }

      let query = supabase
        .from("pastes")
        .select("*")
        .order("created_at", {
          ascending: false
        });

      if (session) {
        const { data, error } = await query;

        if (error) {
          return setMessage(error.message);
        }

        setPastes(data || []);
      } else {
        const { data, error } =
          await query.eq("visibility", "public");

        if (error) {
          return setMessage(error.message);
        }

        setPastes(data || []);
      }

      setMessage("");
    }

    load();
  }, [session]);

  return (
    <section className="content-page">
      <PageHeading
        eyebrow="MKP // ARCHIVE"
        title="PASTES"
        subtitle="Public posts and your accessible private posts."
      />

      {message && (
        <div className="notice">
          {message}
        </div>
      )}

      <div className="paste-grid">
        {pastes.map(p => (
          <article
            className="paste-card"
            key={p.id}
          >
            <div className="paste-top">
              <span className="status-dot" />

              <span>
                {p.visibility.toUpperCase()}
              </span>
            </div>

            <h3>{p.title}</h3>

            <p>
              {p.description ||
                "No description."}
            </p>

            <small>
              {new Date(
                p.created_at
              ).toLocaleString()}
            </small>

            {session &&
              p.user_id === session.user.id && (
                <span className="owner-tag">
                  YOU
                </span>
              )}
          </article>
        ))}
      </div>

      {!message && pastes.length === 0 && (
        <div className="empty">
          No pastes yet.
        </div>
      )}
    </section>
  );
}

function Users({ activeUsers = [] }) {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    if (!supabase) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    async function loadUsers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, role, created_at")
        .order("created_at", { ascending: true });

      if (error) {
        setMessage(error.message);
        return;
      }

      setUsers(data || []);
      setMessage("");
    }

    loadUsers();
  }, []);

  return (
    <section className="content-page">
      <PageHeading
        eyebrow="MKP // COMMUNITY"
        title="USERS"
        subtitle="MKP community members and current activity."
      />

      {message && (
        <div className="notice">
          {message}
        </div>
      )}

      {!message && users.length === 0 && (
        <div className="panel">
          <p className="muted">
            No users found.
          </p>
        </div>
      )}

      {!message && users.length > 0 && (
        <div className="panel">
          <div className="user-list">
            {users.map((user) => {
              const isActive = activeUsers.includes(user.id);

              return (
                <div
                  className="user-row"
                  key={user.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    padding: "14px 0",
                    borderBottom:
                      "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <div>
                    <strong>
                      {user.username || "Unknown User"}
                    </strong>

                    <div className="muted">
                      {user.role || "Member"}
                    </div>
                  </div>

                  <div
                    style={{
                      whiteSpace: "nowrap",
                      fontWeight: "700",
                      fontSize: "13px"
                    }}
                  >
                    <span style={{ marginRight: "7px" }}>
                      {isActive ? "●" : "○"}
                    </span>

                    {isActive ? "ACTIVE" : "OFFLINE"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}function AdminPanel({ session, role }) {
  const [users, setUsers] = useState([]);
  const [pastes, setPastes] = useState([]);
  const [selectedPaste, setSelectedPaste] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const canAccessAdmin =
  ADMIN_ROLES.includes(role);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    if (!canAccessAdmin) {
      setLoading(false);
      return;
    }

    loadAdminData();
  }, [session, role]);

  async function loadAdminData() {
    setLoading(true);
    setMessage("");

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    if (!ADMIN_ROLES.includes(profile?.role)) {
      setMessage(
        "You do not have permission to access the Admin Panel."
      );
      setLoading(false);
      return;
    }

    const {
      data: userData,
      error: userError
    } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (userError) {
      setMessage(userError.message);
      setLoading(false);
      return;
    }

    const {
      data: pasteData,
      error: pasteError
    } = await supabase
      .from("pastes")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (pasteError) {
      setMessage(pasteError.message);
      setLoading(false);
      return;
    }

    setUsers(userData || []);
    setPastes(pasteData || []);
    setLoading(false);
  }

  async function deletePaste(paste) {
    const confirmed = window.confirm(
  "Are you sure you want to delete \"" +
  (paste.title || "Untitled Paste") +
  "\"?\n\nThis will permanently delete the paste and its uploaded file."
);

    if (!confirmed) return;

    setDeletingId(paste.id);
    setMessage("");

    if (paste.file_path) {
      const {
        error: storageError
      } = await supabase.storage
        .from("pastes")
        .remove([paste.file_path]);

      if (storageError) {
        setMessage(
          "File deletion failed: " +
          storageError.message
        );

        setDeletingId(null);
        return;
      }
    }

    const { error } =
      await supabase
        .from("pastes")
        .delete()
        .eq("id", paste.id);

    if (error) {
      setMessage(
        "Paste deletion failed: " +
        error.message
      );

      setDeletingId(null);
      return;
    }

    setPastes(current =>
      current.filter(
        item => item.id !== paste.id
      )
    );

    if (
      selectedPaste?.id === paste.id
    ) {
      setSelectedPaste(null);
    }

    setMessage(
      "Paste deleted successfully."
    );

    setDeletingId(null);
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!canAccessAdmin) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (loading) {
    return (
      <div className="page">
        <h1>Admin Panel</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Admin Panel</h1>

      {message && (
        <p>{message}</p>
      )}

      <section>
        <h2>ALL USERS</h2>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div>
            {users.map(user => (
              <div
                key={user.id}
                style={{
                  marginBottom: "15px"
                }}
              >
                <strong>
                  {user.username ||
                    "No username"}
                </strong>

                <div>
                  {user.id}
                </div>

                <div>
                  Role: {user.role || "user"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>ALL PASTES</h2>

        {pastes.length === 0 ? (
          <p>No pastes found.</p>
        ) : (
          <div>
            {pastes.map(paste => (
              <div
                key={paste.id}
                style={{
                  marginBottom: "20px"
                }}
              >
                <h3>
                  {paste.title ||
                    "Untitled Paste"}
                </h3>

                <p>
                  {paste.description ||
                    "No description"}
                </p>

                <p>
                  Visibility:{" "}
                  {paste.visibility ||
                    "private"}
                </p>

                <button
                  onClick={() =>
                    setSelectedPaste(
                      paste
                    )
                  }
                >
                  READ
                </button>

                <button
                  onClick={() =>
                    deletePaste(
                      paste
                    )
                  }
                  disabled={
                    deletingId ===
                    paste.id
                  }
                >
                  {deletingId ===
                  paste.id
                    ? "DELETING..."
                    : "DELETE"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedPaste && (
        <section>
          <h2>PASTE CONTENT</h2>

          <h3>
            {selectedPaste.title ||
              "Untitled Paste"}
          </h3>

          <p>
            {selectedPaste.description ||
              "No description"}
          </p>

          <pre>
            {selectedPaste.content ||
              "No content."}
          </pre>

          <button
            onClick={() =>
              setSelectedPaste(null)
            }
          >
            CLOSE
          </button>
        </section>
      )}
    </div>
  );
}

function Roster() {
  return (
    <section className="content-page">
      <PageHeading
        eyebrow="MKP // ROSTER"
        title="MKP ROSTER 2026"
        subtitle="Current MKP roster."
      />

      <div className="roster">
        {roster.map(
          ([name, role], i) => (
            <div
              className="roster-row"
              key={name}
            >
              <span className="roster-number">
                {String(i + 1).padStart(
                  2,
                  "0"
                )}
              </span>

              <strong>{name}</strong>

              <span className="role">
                {role}
              </span>
            </div>
          )
        )}
      </div>
    </section>
  );
}

function Terms({ session }) {
  const [accepted, setAccepted] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function accept() {
    if (!session) {
      return setMessage(
        "Log in before accepting the TOS."
      );
    }

    if (!supabase) {
      return setMessage(
        "Supabase is not configured yet."
      );
    }

    const { error } =
      await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          tos_accepted: true,
          tos_accepted_at:
            new Date().toISOString()
        });

    if (error) {
      return setMessage(
        error.message
      );
    }

    setAccepted(true);
    setMessage(
      "TOS acceptance saved."
    );
  }

  return (
    <section className="content-page">
      <PageHeading
        eyebrow="MKP // LEGAL"
        title="TERMS OF SERVICE"
        subtitle="Current controlling version."
      />

      <article className="terms panel">
        <p>
          MKP exists to give people a place
          to post information without
          worrying about getting censored.
          We only pull content down when it
          runs afoul of a rule we've actually
          written down somewhere.
        </p>

        <p>
          What follows is the current,
          controlling version of our Terms of
          Service, plus some general
          background on how things work.
          Using MKP at all, in any capacity,
          means you've agreed to what's
          written here. Not on board with
          these terms? Then this isn't the
          site for you. Nobody is forced to
          use MKP; it's your call entirely.
        </p>

        <h2>Rules</h2>

        <p>
          Do not use MKP to distribute
          content that violates applicable
          law, infringe other people's rights,
          compromise accounts or systems, or
          abuse the service. We may remove
          content or restrict accounts when it
          violates these written rules or
          applicable law.
        </p>

        <p>
          By using MKP, you agree to follow
          these terms. You are responsible for
          the content you upload and for
          protecting your account credentials.
        </p>

        <div className="tos-box">
          <label className="check">
            <input
              type="checkbox"
              checked={accepted}
              onChange={e =>
                setAccepted(
                  e.target.checked
                )
              }
            />

            I have read and agree to the MKP
            Terms of Service.
          </label>

          <button
            className="primary-btn"
            onClick={accept}
            disabled={!accepted}
          >
            ACCEPT TOS
          </button>

          {message && (
            <div className="form-message">
              {message}
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

function Support() {
  return (
    <section className="content-page">
      <PageHeading
        eyebrow="MKP // HELP"
        title="SUPPORT"
        subtitle="Need help with MKP?"
      />

      <div className="panel support">
        <p>
          Need help with MKP? Join the
          official MKP Telegram support server.
        </p>

        <a
          className="button"
          href="https://t.me/+tcuL_pBtobAxYWZh"
          target="_blank"
          rel="noopener noreferrer"
        >
          JOIN TELEGRAM SUPPORT
        </a>
      </div>
    </section>
  );
}

function PageHeading({
  eyebrow,
  title,
  subtitle
}) {
  return (
    <div className="page-heading">
      <div className="eyebrow">
        {eyebrow}
      </div>

      <h1
        className="glitch"
        data-text={title}
      >
        {title}
      </h1>

      <p>{subtitle}</p>
    </div>
  );
}

function App() {
  const [session, setSession] =
    useState(null);

  const [role, setRole] =
    useState(null);

const [activeUsers, setActiveUsers] = 
   useState([]);
  /*
   * Get the logged-in user's profile role.
   */
  useEffect(() => {
    if (!supabase) return;

    async function loadSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      setSession(session);

      if (session?.user?.id) {
        const { data } =
          await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

        setRole(data?.role || null);
      } else {
        setRole(null);
      }
    }

    loadSession();

    const {
      data: listener
    } =
      supabase.auth.onAuthStateChange(
        async (_event, next) => {
          setSession(next);

          if (next?.user?.id) {
            const { data } =
              await supabase
                .from("profiles")
                .select("role")
                .eq("id", next.user.id)
                .single();

            setRole(data?.role || null);
          } else {
            setRole(null);
          }
        }
      );

    return () =>
      listener.subscription.unsubscribe();
  }, []);

  /*
   * Global online presence.
   *
   * Every logged-in user is tracked through
   * Supabase Realtime. When they close the
   * browser or disconnect, Supabase removes
   * their presence automatically.
   */
  useEffect(() => {
  if (!supabase || !session?.user?.id) {
    setActiveUsers([]);
    return;
  }

  const channel = supabase.channel("mkp-online-users", {
    config: {
      presence: {
        key: session.user.id
      }
    }
  });

  const updatePresence = () => {
    const state = channel.presenceState();

    const ids = Object.values(state)
      .flat()
      .map((presence) => presence.user_id)
      .filter(Boolean);

    setActiveUsers([...new Set(ids)]);
  };

  channel.on(
    "presence",
    { event: "sync" },
    updatePresence
  );

  channel.on(
    "presence",
    { event: "join" },
    updatePresence
  );

  channel.on(
    "presence",
    { event: "leave" },
    updatePresence
  );

  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.track({
        user_id: session.user.id
      });

      updatePresence();
    }
  });

  return () => {
    channel.untrack();
    supabase.removeChannel(channel);
    setActiveUsers([]);
  };
}, [session?.user?.id]);

  return (
    <Layout
      session={session}
      role={role}
    >
      <Routes>
        <Route
          path="/"
          element={
            <Home session={session} />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/add-paste"
          element={
            <AddPaste
              session={session}
            />
          }
        />

        <Route
          path="/pastes"
          element={
            <Pastes
              session={session}
            />
          }
        />

        <Route
  path="/users"
  element={
    <Users activeUsers={activeUsers} />
  }
/>

        <Route
          path="/admin"
          element={
            <AdminPanel
              session={session}
              role={role}
            />
          }
        />

        <Route
          path="/roster"
          element={<Roster />}
        />

        <Route
          path="/terms"
          element={
            <Terms
              session={session}
            />
          }
        />

        <Route
          path="/support"
          element={<Support />}
        />
      </Routes>
    </Layout>
  );
}

export default App;
