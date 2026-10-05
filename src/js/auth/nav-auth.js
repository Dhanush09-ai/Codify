import { supabase } from '../config/supabase-client.js';

// 1. Sign Out Logic (Exposed Globally)
window.handleSignOut = async function() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        localStorage.clear();
        window.location.href = '/src/auth/login.html';
    } catch (error) {
        console.error('Error signing out:', error.message);
    }
};

// 2. Toggle Dropdown Menu Visibility with Smooth State Check
window.toggleProfileMenu = function(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('profileDropdownMenu');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
};

// 3. Close Dropdown when clicking outside
document.addEventListener('click', (event) => {
    const profileMenu = document.getElementById('userProfileMenu');
    const dropdown = document.getElementById('profileDropdownMenu');
    
    if (profileMenu && dropdown && !profileMenu.contains(event.target)) {
        dropdown.classList.remove('active');
    }
});

// 4. Render Dynamic Navbar Authentication State with Profile Picture
async function renderNavbarAuth() {
    const authNavGroup = document.getElementById('authNavGroup');
    if (!authNavGroup) return;

    try {
        // Fetch current session
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (user) {
            // Fetch profile details from database table
            const { data: profile } = await supabase
                .from('profiles')
                .select('avatar_url, first_name, username')
                .eq('id', user.id)
                .maybeSingle();

            const userMetaData = user.user_metadata || {};

            // Prioritize Database Storage Avatar
            const avatarUrl = profile?.avatar_url || userMetaData.avatar_url;

            // Name & Username Handle formatting
            const emailPrefix = user.email ? user.email.split('@')[0] : 'user';
            const firstName = profile?.first_name || userMetaData.first_name || userMetaData.given_name || 'User';
            const username = profile?.username ? `@${profile.username}` : `@${emailPrefix}`;

            // Initial letter fallback if image is missing
            const dpInitial = firstName.charAt(0).toUpperCase();

            // Construct Avatar HTML for top nav bar
            const btnAvatarHtml = avatarUrl
                ? `<img src="${avatarUrl}" alt="${firstName}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid #00aaff;">`
                : `<span class="initial-badge">${dpInitial}</span>`;

            // Construct Avatar HTML for dropdown header
            const dropdownHeaderAvatarHtml = avatarUrl
                ? `<img src="${avatarUrl}" alt="${firstName}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">`
                : `${dpInitial}`;

            // Inject Profile Dropdown HTML with smooth transition properties (.active selector drives visibility and animation)
            authNavGroup.innerHTML = `
                <div class="user-profile-menu" id="userProfileMenu" style="position: relative; display: inline-block;">
                    <button class="profile-avatar-btn" onclick="toggleProfileMenu(event)" aria-label="User Profile" style="background: none; border: none; padding: 0; cursor: pointer; display: flex; align-items: center;">
                        ${btnAvatarHtml}
                    </button>

                    <div class="profile-dropdown-menu" id="profileDropdownMenu" style="position: absolute; top: calc(100% + 12px); right: 0; width: 280px; background: rgba(13, 27, 42, 0.98); border: 1px solid rgba(0, 170, 255, 0.35); border-radius: 16px; backdrop-filter: blur(16px); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 170, 255, 0.15); padding: 16px; display: flex; flex-direction: column; z-index: 3000; opacity: 0; visibility: hidden; transform: translateY(-10px) scale(0.98); transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s ease;">
                        
                        <!-- Dropdown Header: Avatar Left, Details Right -->
                        <div class="dropdown-header" style="display: flex; align-items: center; gap: 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(0, 170, 255, 0.15); margin-bottom: 8px;">
                            <div class="dropdown-avatar-container" style="width: 60px; height: 60px; border-radius: 50%; overflow: hidden; border: 2px solid #00aaff; display: flex; align-items: center; justify-content: center; background: rgba(0, 170, 255, 0.15); color: #00aaff; font-weight: 800; font-size: 1.1rem; flex-shrink: 0;">
                                ${dropdownHeaderAvatarHtml}
                            </div>
                            <div class="dropdown-user-details" style="display: flex; flex-direction: column; overflow: hidden;">
                                <span class="dropdown-user-name" style="font-size: 1rem; font-weight: 800; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${firstName}</span>
                                <span class="dropdown-user-handle" style="font-size: 0.82rem; color: #00aaff; font-weight: 700;">${username}</span>
                                <span class="dropdown-user-email" style="font-size: 0.75rem; color: #94a3b8; word-break: break-all; margin-top: 1px;">${user.email}</span>
                            </div>
                        </div>

                        <div class="dropdown-body" style="display: flex; flex-direction: column; gap: 4px;">
                            <a href="/src/pages/profile.html" class="dropdown-item" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; color: #cbd5e1; text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: all 0.2s ease;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00aaff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                Profile Settings
                            </a>

                            <a href="/src/pages/certificate.html" class="dropdown-item" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; color: #cbd5e1; text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: all 0.2s ease;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00aaff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
                                Achievements
                            </a>

                            <a href="/src/pages/exam-history.html" class="dropdown-item" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; color: #cbd5e1; text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: all 0.2s ease;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00aaff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                Activity
                            </a>

                            <a href="/src/pages/profile.html#security" class="dropdown-item" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; color: #cbd5e1; text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: all 0.2s ease;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00aaff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                Account Security
                            </a>

                            <div class="dropdown-divider" style="height: 1px; background: rgba(0, 170, 255, 0.15); margin: 8px 0;"></div>

                            <a href="/src/auth/login.html" class="dropdown-item" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; color: #cbd5e1; text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: all 0.2s ease;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00aaff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 17l5-5-5-5"></path><path d="M21 12H9"></path><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7"></path></svg>
                                Switch Account
                            </a>

                            <button class="dropdown-item logout-btn" onclick="handleSignOut()" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; color: #f87171; text-decoration: none; font-size: 0.9rem; font-weight: 600; background: transparent; border: none; width: 100%; text-align: left; cursor: pointer; transition: all 0.2s ease;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Inject dynamic style rule for the active animation state so it handles opacity & sliding smoothly
            if (!document.getElementById('profileDropdownAnimStyle')) {
                const styleEl = document.createElement('style');
                styleEl.id = 'profileDropdownAnimStyle';
                styleEl.innerHTML = `
                    #profileDropdownMenu.active {
                        opacity: 1 !important;
                        visibility: visible !important;
                        transform: translateY(0) scale(1) !important;
                    }
                `;
                document.head.appendChild(styleEl);
            }
        } else {
            // Unauthenticated Guest state
            authNavGroup.innerHTML = `
                <a href="/src/auth/login.html" class="codify-btn-outline">Login</a>
                <a href="/src/auth/signup.html" class="codify-btn-outline">Signup</a>
            `;
        }
    } catch (error) {
        console.error('Navbar Auth initialization failed:', error);
    } finally {
        authNavGroup.classList.add('ready');
    }
}

// Single auth change listener
supabase.auth.onAuthStateChange((event) => {
    if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
        renderNavbarAuth();
    }
});

// Run immediately when DOM is ready
document.addEventListener('DOMContentLoaded', renderNavbarAuth);