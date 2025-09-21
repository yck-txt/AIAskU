import type { SupportTicket, SupportMessage } from '../types';

const SUPPORT_TICKETS_KEY = 'support_tickets';

const getTickets = (): SupportTicket[] => {
    try {
        const ticketsJson = localStorage.getItem(SUPPORT_TICKETS_KEY);
        return ticketsJson ? JSON.parse(ticketsJson) : [];
    } catch (error) {
        console.error("Failed to parse support tickets from localStorage:", error);
        return [];
    }
};

const saveTickets = (tickets: SupportTicket[]) => {
    localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify(tickets));
};

export const getTicketForUser = (username: string): SupportTicket => {
    const tickets = getTickets();
    let userTicket = tickets.find(t => t.username === username);
    if (!userTicket) {
        userTicket = {
            username,
            messages: [],
            lastMessageFrom: null,
            userHasUnread: false,
            adminHasUnread: false,
        };
        tickets.push(userTicket);
        saveTickets(tickets);
    }
    return userTicket;
};

export const getAllTickets = (): SupportTicket[] => {
    return getTickets();
};

export const sendMessageFromUser = (username: string, text: string): { success: boolean, ticket: SupportTicket | null } => {
    const tickets = getTickets();
    const ticketIndex = tickets.findIndex(t => t.username === username);
    if (ticketIndex === -1) {
        // This case should be handled by getTicketForUser, but as a fallback:
        const newTicket: SupportTicket = { 
            username, 
            messages: [],
            lastMessageFrom: null,
            userHasUnread: false,
            adminHasUnread: false,
        };
        tickets.push(newTicket);
        saveTickets(tickets); // save to get a consistent state
        return sendMessageFromUser(username, text); // and retry
    }

    const ticket = tickets[ticketIndex];

    // Spam prevention: user can only send a message if the last message was from an admin or it's a new ticket
    if (ticket.lastMessageFrom === 'user') {
        return { success: false, ticket: null };
    }

    const newMessage: SupportMessage = {
        sender: 'user',
        text,
        timestamp: new Date().toISOString(),
        isRead: false,
    };

    ticket.messages.push(newMessage);
    ticket.lastMessageFrom = 'user';
    ticket.adminHasUnread = true;
    ticket.userHasUnread = false; // User's own message is considered "read" by them

    saveTickets(tickets);
    return { success: true, ticket };
};

export const sendMessageFromAdmin = (username: string, text: string): { success: boolean, ticket: SupportTicket | null } => {
    const tickets = getTickets();
    const ticketIndex = tickets.findIndex(t => t.username === username);
    if (ticketIndex === -1) {
        return { success: false, ticket: null };
    }

    const ticket = tickets[ticketIndex];
    const newMessage: SupportMessage = {
        sender: 'admin',
        text,
        timestamp: new Date().toISOString(),
        isRead: false,
    };
    
    ticket.messages.push(newMessage);
    ticket.lastMessageFrom = 'admin';
    ticket.userHasUnread = true;
    ticket.adminHasUnread = false; // Admin's own message is considered "read" by them

    saveTickets(tickets);
    return { success: true, ticket };
};

export const markUserMessagesAsRead = (username: string): SupportTicket | null => {
    const tickets = getTickets();
    const ticketIndex = tickets.findIndex(t => t.username === username);
    if (ticketIndex === -1) return null;
    
    const ticket = tickets[ticketIndex];
    ticket.userHasUnread = false;
    ticket.messages.forEach(msg => {
        if (msg.sender === 'admin') msg.isRead = true;
    });

    saveTickets(tickets);
    return ticket;
};

export const markAdminMessagesAsRead = (username: string): SupportTicket | null => {
    const tickets = getTickets();
    const ticketIndex = tickets.findIndex(t => t.username === username);
    if (ticketIndex === -1) return null;
    
    const ticket = tickets[ticketIndex];
    ticket.adminHasUnread = false;
     ticket.messages.forEach(msg => {
        if (msg.sender === 'user') msg.isRead = true;
    });

    saveTickets(tickets);
    return ticket;
};