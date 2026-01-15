// ==================== BUS SCHEDULER APPLICATION ====================

// Application State
const appState = {
    currentUser: null,
    userType: null,
    currentBus: {
        id: 1,
        name: "City Express",
        number: "KA-01-AB-1234",
        route: "City Center - Suburbs",
        capacity: 40,
        vacantSeats: 15,
        fare: 25,
        stops: ["City Center", "Market Street", "University", "Tech Park", "North Suburbs"]
    },
    passengerData: {
        rideCount: 0,
        freeRides: 1,
        nextFreeRide: 6,
        totalSavings: 0
    },
    bookings: [],
    history: []
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚌 BusConnect Pro - Loading...");
    
    // Load saved data
    loadSavedData();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Initialize UI
    updateUI();
    
    console.log("✅ Application ready!");
});

function loadSavedData() {
    try {
        const savedPassenger = localStorage.getItem('busconnect_passenger');
        const savedBookings = localStorage.getItem('busconnect_bookings');
        const savedHistory = localStorage.getItem('busconnect_history');
        
        if (savedPassenger) appState.passengerData = JSON.parse(savedPassenger);
        if (savedBookings) appState.bookings = JSON.parse(savedBookings);
        if (savedHistory) appState.history = JSON.parse(savedHistory);
    } catch (e) {
        console.log("No saved data found, using defaults");
    }
}

function saveData() {
    localStorage.setItem('busconnect_passenger', JSON.stringify(appState.passengerData));
    localStorage.setItem('busconnect_bookings', JSON.stringify(appState.bookings));
    localStorage.setItem('busconnect_history', JSON.stringify(appState.history));
}

// ==================== NAVIGATION ====================
function showSection(sectionId) {
    console.log("Showing section:", sectionId);
    
    // Hide all sections
    const sections = document.querySelectorAll('.page-section, .login-section, .dashboard-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update active nav link for main sections
        if (!['passengerLogin', 'conductorLogin', 'passengerDashboard', 'conductorDashboard'].includes(sectionId)) {
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (navLink) navLink.classList.add('active');
        }
    }
    
    // Close mobile menu
    document.getElementById('navMenu')?.classList.remove('active');
    
    // Initialize section if needed
    if (sectionId === 'passengerDashboard') {
        initializePassengerDashboard();
    } else if (sectionId === 'conductorDashboard') {
        initializeConductorDashboard();
    } else if (sectionId === 'history') {
        updateHistory();
    }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Mobile menu toggle
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            document.getElementById('navMenu').classList.toggle('active');
        });
    }
    
    // Role cards click
    const passengerCard = document.getElementById('passengerCard');
    const conductorCard = document.getElementById('conductorCard');
    
    if (passengerCard) {
        passengerCard.addEventListener('click', function() {
            showLogin('passenger');
        });
    }
    
    if (conductorCard) {
        conductorCard.addEventListener('click', function() {
            showLogin('conductor');
        });
    }
    
    // Role buttons click
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.role-card');
            if (card.classList.contains('passenger-card')) {
                showLogin('passenger');
            } else {
                showLogin('conductor');
            }
        });
    });
    
    // Login forms
    const passengerForm = document.getElementById('passengerLoginForm');
    const conductorForm = document.getElementById('conductorLoginForm');
    
    if (passengerForm) {
        passengerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin('passenger');
        });
    }
    
    if (conductorForm) {
        conductorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin('conductor');
        });
    }
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactSubmit();
        });
    }
    
    // Seat count change
    const seatCountInput = document.getElementById('seatCount');
    if (seatCountInput) {
        seatCountInput.addEventListener('input', updateFareDisplay);
    }
    
    // Modal close
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('bookingModal');
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Back to top button (if exists)
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.style.display = 'block';
            } else {
                backToTop.style.display = 'none';
            }
        });
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            if (email) {
                showNotification('🎉 Thank you for subscribing!', 'success');
                this.reset();
            }
        });
    }
}

// ==================== LOGIN SYSTEM ====================
function showLogin(userType) {
    console.log("Opening login for:", userType);
    
    if (userType === 'passenger') {
        showSection('passengerLogin');
    } else {
        showSection('conductorLogin');
    }
}

function handleLogin(userType) {
    console.log("Handling login for:", userType);
    
    // Get credentials
    let userId, userName;
    
    if (userType === 'passenger') {
        userId = document.getElementById('passengerId').value.trim();
        userName = userId || 'Passenger';
    } else {
        userId = document.getElementById('conductorId').value.trim();
        userName = 'Bus Conductor';
    }
    
    // Validate (simple demo validation)
    if (!userId) {
        showNotification('Please enter your ID', 'warning');
        return;
    }
    
    // Set user data
    appState.currentUser = {
        id: userId,
        name: userName,
        type: userType
    };
    appState.userType = userType;
    
    // Update UI
    updateUI();
    
    // Show dashboard
    showDashboard(userType);
    
    // Show welcome message
    showNotification(`👋 Welcome ${userName}!`, 'success');
}

function showDashboard(userType) {
    if (userType === 'passenger') {
        showSection('passengerDashboard');
    } else {
        showSection('conductorDashboard');
    }
}

function logout() {
    appState.currentUser = null;
    appState.userType = null;
    updateUI();
    showSection('home');
    showNotification('👋 Logged out successfully', 'info');
}

// ==================== PASSENGER FUNCTIONS ====================
function initializePassengerDashboard() {
    // Update passenger name
    if (appState.currentUser && document.getElementById('passengerName')) {
        document.getElementById('passengerName').textContent = appState.currentUser.name;
    }
    
    // Update ride counter
    updateRideCounter();
    
    // Search for buses
    searchBuses();
}

function searchBuses() {
    const pickup = document.getElementById('pickupLocation').value;
    const destination = document.getElementById('destination').value;
    const resultsDiv = document.getElementById('busResults');
    
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '';
    
    if (!pickup || !destination) {
        resultsDiv.innerHTML = '<p class="no-results">Please enter both pickup and destination locations</p>';
        return;
    }
    
    // Create bus card
    const busCard = document.createElement('div');
    busCard.className = 'bus-card';
    busCard.innerHTML = `
        <div class="bus-info">
            <h4>${appState.currentBus.name} (${appState.currentBus.number})</h4>
            <p><i class="fas fa-route"></i> ${appState.currentBus.route}</p>
            <p><i class="fas fa-map-marker-alt"></i> From ${appState.currentBus.stops[0]} to ${appState.currentBus.stops[appState.currentBus.stops.length - 1]}</p>
            <p><i class="fas fa-clock"></i> Current: ${appState.currentBus.stops[1]}</p>
        </div>
        <div class="seat-info">
            <p class="available"><i class="fas fa-chair"></i> ${appState.currentBus.vacantSeats} seats available</p>
            <p class="eta"><i class="fas fa-running"></i> ETA to pickup: 5 min</p>
            <p>Fare: $${appState.currentBus.fare}</p>
        </div>
        <button class="book-btn" onclick="openBookingModal()">
            <i class="fas fa-ticket-alt"></i> Book Now
        </button>
    `;
    
    resultsDiv.appendChild(busCard);
}

function openBookingModal() {
    const modal = document.getElementById('bookingModal');
    const modalSeats = document.getElementById('modalSeats');
    
    if (modalSeats) {
        modalSeats.textContent = appState.currentBus.vacantSeats;
    }
    
    updateFareDisplay();
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

function updateFareDisplay() {
    const seatCount = parseInt(document.getElementById('seatCount')?.value) || 1;
    const totalFare = seatCount * appState.currentBus.fare;
    const freeRide = appState.passengerData.rideCount === 0 && appState.passengerData.freeRides > 0;
    
    const fareAmount = document.getElementById('fareAmount');
    const freeRideMessage = document.getElementById('freeRideMessage');
    
    if (fareAmount) {
        fareAmount.textContent = freeRide ? '🎉 FIRST RIDE FREE!' : `Total Fare: $${totalFare}`;
    }
    
    if (freeRideMessage) {
        freeRideMessage.style.display = freeRide ? 'block' : 'none';
    }
}

function confirmBooking() {
    const seatCount = parseInt(document.getElementById('seatCount')?.value) || 1;
    
    // Validate
    if (seatCount > appState.currentBus.vacantSeats) {
        showNotification('❌ Not enough seats available!', 'warning');
        return;
    }
    
    if (seatCount < 1) {
        showNotification('❌ Please select at least 1 seat', 'warning');
        return;
    }
    
    // Check if free ride available
    const isFree = appState.passengerData.rideCount === 0 && appState.passengerData.freeRides > 0;
    const fare = isFree ? 0 : seatCount * appState.currentBus.fare;
    
    // Update bus seats
    appState.currentBus.vacantSeats -= seatCount;
    
    // Update conductor display if open
    if (document.getElementById('vacantSeats')) {
        document.getElementById('vacantSeats').textContent = appState.currentBus.vacantSeats;
        updateOccupancy();
    }
    
    // Update passenger data
    appState.passengerData.rideCount++;
    
    if (isFree) {
        appState.passengerData.freeRides--;
        appState.passengerData.totalSavings += seatCount * appState.currentBus.fare;
    }
    
    // Check for next free ride
    if (appState.passengerData.rideCount >= appState.passengerData.nextFreeRide) {
        appState.passengerData.freeRides++;
        appState.passengerData.nextFreeRide += 6;
    }
    
    // Create booking record
    const booking = {
        id: Date.now(),
        busName: appState.currentBus.name,
        busNumber: appState.currentBus.number,
        seats: seatCount,
        fare: fare,
        date: new Date().toLocaleString(),
        isFree: isFree
    };
    
    appState.bookings.push(booking);
    
    // Add to history
    const historyEntry = {
        id: Date.now(),
        type: 'booking',
        title: `Booked ${seatCount} seat(s) on ${appState.currentBus.name}`,
        description: `${document.getElementById('pickupLocation').value} → ${document.getElementById('destination').value}`,
        details: `Bus: ${appState.currentBus.number} | Fare: ${isFree ? 'FREE' : '$' + fare}`,
        date: new Date().toLocaleString()
    };
    
    appState.history.unshift(historyEntry);
    
    // Save data
    saveData();
    
    // Update UI
    updateRideCounter();
    updateHistory();
    closeModal();
    
    // Show success message
    showNotification(`✅ Booking confirmed! ${isFree ? '🎉 This ride is FREE!' : `Fare: $${fare}`}`, 'success');
    
    // Refresh bus results
    searchBuses();
}

// ==================== CONDUCTOR FUNCTIONS ====================
function initializeConductorDashboard() {
    // Update bus info in form
    document.getElementById('busName').value = appState.currentBus.name;
    document.getElementById('busNumber').value = appState.currentBus.number;
    document.getElementById('route').value = appState.currentBus.route;
    document.getElementById('capacity').value = appState.currentBus.capacity;
    document.getElementById('vacantSeats').textContent = appState.currentBus.vacantSeats;
    document.getElementById('totalCapacity').textContent = appState.currentBus.capacity;
    document.getElementById('currentBusName').textContent = appState.currentBus.name;
    
    // Update occupancy
    updateOccupancy();
}

function updateBusInfo() {
    const busName = document.getElementById('busName').value;
    const busNumber = document.getElementById('busNumber').value;
    const route = document.getElementById('route').value;
    const capacity = parseInt(document.getElementById('capacity').value);
    
    // Validate
    if (!busName || !busNumber || !route || !capacity) {
        showNotification('❌ Please fill all fields', 'warning');
        return;
    }
    
    if (capacity < 1) {
        showNotification('❌ Capacity must be at least 1', 'warning');
        return;
    }
    
    // Update bus data
    appState.currentBus.name = busName;
    appState.currentBus.number = busNumber;
    appState.currentBus.route = route;
    appState.currentBus.capacity = capacity;
    
    // Ensure vacant seats don't exceed capacity
    if (appState.currentBus.vacantSeats > capacity) {
        appState.currentBus.vacantSeats = capacity;
    }
    
    // Update display
    document.getElementById('vacantSeats').textContent = appState.currentBus.vacantSeats;
    document.getElementById('totalCapacity').textContent = capacity;
    document.getElementById('currentBusName').textContent = busName;
    
    // Update occupancy
    updateOccupancy();
    
    // Add to history
    const historyEntry = {
        id: Date.now(),
        type: 'update',
        title: 'Bus Information Updated',
        description: `Updated ${busName} details`,
        details: `New capacity: ${capacity} | Route: ${route}`,
        date: new Date().toLocaleString()
    };
    
    appState.history.unshift(historyEntry);
    
    // Save data
    saveData();
    
    showNotification('✅ Bus information updated successfully!', 'success');
}

function adjustSeats(change) {
    const newVacant = appState.currentBus.vacantSeats + change;
    
    // Validate
    if (newVacant < 0) {
        showNotification('❌ Cannot have negative seats', 'warning');
        return;
    }
    
    if (newVacant > appState.currentBus.capacity) {
        showNotification(`❌ Cannot exceed capacity of ${appState.currentBus.capacity}`, 'warning');
        return;
    }
    
    // Update
    appState.currentBus.vacantSeats = newVacant;
    document.getElementById('vacantSeats').textContent = newVacant;
    updateOccupancy();
    
    // Save data
    saveData();
    
    showNotification(`💺 Seats updated to ${newVacant}`, 'info');
}

function updateOccupancy() {
    const occupied = appState.currentBus.capacity - appState.currentBus.vacantSeats;
    const occupancy = (occupied / appState.currentBus.capacity * 100).toFixed(1);
    document.getElementById('occupancy').textContent = `${occupancy}%`;
}

// ==================== HISTORY FUNCTIONS ====================
function updateHistory() {
    updateHistoryStats();
    
    const timeline = document.getElementById('historyTimeline');
    if (!timeline) return;
    
    if (appState.history.length === 0) {
        timeline.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-history fa-3x"></i>
                <h4>No journey history yet</h4>
                <p>Your travel history will appear here after booking rides</p>
            </div>
        `;
        return;
    }
    
    // Show recent history (last 10 entries)
    const recentHistory = appState.history.slice(0, 10);
    
    timeline.innerHTML = recentHistory.map(item => `
        <div class="history-item" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid ${item.type === 'booking' ? '#4CAF50' : '#2196F3'};">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #333;">${item.title}</h4>
                    <p style="margin: 0 0 5px 0; color: #666;">${item.description}</p>
                    ${item.details ? `<p style="margin: 0; color: #888; font-size: 0.9em;">${item.details}</p>` : ''}
                </div>
                <span style="color: #999; font-size: 0.8em;">${item.date}</span>
            </div>
        </div>
    `).join('');
}

function updateHistoryStats() {
    const totalRides = appState.passengerData.rideCount || 0;
    const freeRides = Math.floor(totalRides / 6) + (appState.passengerData.freeRides > 0 ? 1 : 0);
    const totalSavings = appState.passengerData.totalSavings || 0;
    
    document.getElementById('totalRides').textContent = totalRides;
    document.getElementById('freeRidesEarned').textContent = freeRides;
    document.getElementById('totalSavings').textContent = `$${totalSavings}`;
}

// ==================== CONTACT FORM ====================
function handleContactSubmit() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    // Simple validation
    if (!name || !email || !subject || !message) {
        showNotification('❌ Please fill all fields', 'warning');
        return;
    }
    
    // In a real app, you would send this to a server
    showNotification('📧 Thank you for your message! We\'ll respond within 24 hours.', 'success');
    
    // Reset form
    document.getElementById('contactForm').reset();
    
    // Add to history
    const historyEntry = {
        id: Date.now(),
        type: 'contact',
        title: 'Contact Form Submitted',
        description: `Subject: ${subject}`,
        details: `From: ${name} (${email})`,
        date: new Date().toLocaleString()
    };
    
    appState.history.unshift(historyEntry);
    saveData();
    updateHistory();
}

// ==================== UTILITY FUNCTIONS ====================
function updateUI() {
    // Update ride counter
    updateRideCounter();
    
    // Update user info if logged in
    if (appState.currentUser) {
        const userSection = document.getElementById('userSection');
        if (userSection) {
            userSection.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                        ${appState.currentUser.name.charAt(0)}
                    </div>
                    <span>${appState.currentUser.name}</span>
                </div>
            `;
        }
    }
}

function updateRideCounter() {
    const rideCounter = document.getElementById('rideCounter');
    if (rideCounter) {
        rideCounter.textContent = `Rides: ${appState.passengerData.rideCount}`;
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; margin-left: 15px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ==================== INITIAL SETUP ====================
// Make sure home is shown on load
window.onload = function() {
    showSection('home');
};