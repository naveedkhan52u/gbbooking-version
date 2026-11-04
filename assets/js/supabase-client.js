/* GBbooking Supabase browser client. Only the publishable key belongs in browser code. */
(function () {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('[GBbooking Auth] Supabase JS failed to load.');
    return;
  }
  const client = window.supabase.createClient(
    'https://dwgmnsjnibwucudsfhan.supabase.co',
    'sb_publishable_uVYWRmU44xQWUoOP52n36A_ot1gi0j-',
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );
  const routes = {
    customer: '/dashboard.html',
    provider: '/provider-dashboard.html',
    admin: '/admin/dashboard.html'
  };
  async function getIdentity() {
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) return null;
    const { data: profile, error: profileError } = await client
      .from('profiles').select('id, role, full_name').eq('id', authData.user.id).single();
    if (profileError) throw profileError;
    if (!profile || !routes[profile.role]) throw new Error('Your account role is missing or invalid.');
    return { user: authData.user, profile };
  }
  function routeForRole(role) { return routes[role] || '/login.html'; }
  async function redirectSignedInUser() {
    try {
      const identity = await getIdentity();
      if (identity) window.location.replace(routeForRole(identity.profile.role));
    } catch (error) { console.error('[GBbooking Auth]', error); }
  }
  async function requireRole(allowedRoles) {
    document.documentElement.classList.add('auth-pending');
    try {
      const identity = await getIdentity();
      if (!identity) { window.location.replace('/login.html'); return; }
      if (!allowedRoles.includes(identity.profile.role)) {
        window.location.replace(routeForRole(identity.profile.role)); return;
      }
      document.documentElement.classList.remove('auth-pending');
      document.dispatchEvent(new CustomEvent('gbbooking:authenticated', { detail: identity }));
      mountLogoutButton();
    } catch (error) {
      console.error('[GBbooking Auth]', error);
      window.location.replace('/login.html?auth_error=profile');
    }
  }
  function mountLogoutButton() {
    const header = document.querySelector('main > header');
    if (!header) return;
    let button = document.getElementById('adminLogout') || document.getElementById('gbAuthLogout');
    if (!button) {
      button = document.createElement('button');
      button.id = 'gbAuthLogout';
      button.type = 'button';
      button.className = 'inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50';
      button.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Log Out';
      header.appendChild(button);
    }
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      button.disabled = true;
      button.textContent = 'Signing out...';
      const { error } = await client.auth.signOut();
      if (error) {
        button.disabled = false;
        button.textContent = 'Log Out';
        alert(error.message);
        return;
      }
      window.location.replace('/login.html');
    }, true);
  }
  window.GBAuth = { client, getIdentity, routeForRole, redirectSignedInUser, requireRole };
})();