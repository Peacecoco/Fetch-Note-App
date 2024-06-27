document.addEventListener('DOMContentLoaded', function() {
    // Find the input box, add button, and notes container
    const newNoteInput = document.getElementById('newNote');
    const createNoteButton = document.getElementById('createNote');
    const notesContainer = document.getElementById('notesContainer');
    let noteId = 0;

    // Load notes from API and local storage
    async function loadNotes() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            if (!response.ok) throw new Error('Network response was not ok.');
            const apiNotes = await response.json();

            // Slice the array to get the first 10 posts
            const slicedNotes = apiNotes.slice(0, 10);

            // Load notes from local storage
            const localNotes = JSON.parse(localStorage.getItem('notes')) || [];

            // Combine local and API notes, prioritizing local notes
            const combinedNotes = [...localNotes, ...slicedNotes.filter(apiNote => !localNotes.find(localNote => localNote.id === apiNote.id))];

            // Populate notes container
            combinedNotes.forEach(note => {
                const noteElement = createNoteElement(note.text || note.title, note.id);
                notesContainer.appendChild(noteElement);
            });

            // Save combined notes back to local storage
            localStorage.setItem('notes', JSON.stringify(combinedNotes));
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    }

    // Save notes to local storage
    function saveNotes() {
        const notes = [];
        notesContainer.querySelectorAll('.note').forEach(note => {
            const input = note.querySelector('input');
            notes.push({ id: parseInt(note.dataset.id, 10), text: input.value });
        });
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // Function to create a new note element
    function createNoteElement(noteText, id) {
        // Create a new note div
        const note = document.createElement('div');
        note.classList.add('note');
        note.dataset.id = id;

        // Create an input box for the note text
        const input = document.createElement('input');
        input.type = 'text';
        input.value = noteText;
        input.disabled = true;

        // Create an edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', async function() {
            input.disabled = !input.disabled;
            editButton.textContent = input.disabled ? 'Edit' : 'Save';

            if (input.disabled) {
                // Send PUT request to update the post on the server
                try {
                    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ id: id, title: input.value, body: input.value, userId: 1 }), // Update the title with the input value
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) {
                        throw new Error("Network response was not ok.");
                    } else {
                        const updatedPost = await response.json();
                        console.log('Updated post:', updatedPost);

                        // Update local storage
                        const notes = JSON.parse(localStorage.getItem('notes')) || [];
                        const noteIndex = notes.findIndex(note => note.id === id);
                        if (noteIndex > -1) {
                            notes[noteIndex].text = input.value;
                            localStorage.setItem('notes', JSON.stringify(notes));
                        }
                    }
                } catch (error) {
                    alert("Oops! Couldn't update the post.");
                    console.error('Error updating post:', error);
                }
            }
        });

        // Create a delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', async function() {
            const noteId = parseInt(note.dataset.id, 10);

            // Send DELETE request to remove the post on the server
            try {
                const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${noteId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok.");
                } else {
                    // Remove the note element locally after successful deletion
                    notesContainer.removeChild(note);

                    // Update local storage
                    const notes = JSON.parse(localStorage.getItem('notes')) || [];
                    const updatedNotes = notes.filter(note => note.id !== noteId);
                    localStorage.setItem('notes', JSON.stringify(updatedNotes));
                }
            } catch (error) {
                alert("Oops! Couldn't delete the post.");
                console.error('Error deleting post:', error);
            }
        });

        // Put the input box, edit button, and delete button into the note div
        note.appendChild(input);
        note.appendChild(editButton);
        note.appendChild(deleteButton);

        return note;
    }

    // When we click the add button
    createNoteButton.addEventListener('click', async function() {
        const noteText = newNoteInput.value.trim();
        if (noteText !== '') {
            try {
                // Send POST request to create a new note on the server
                const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                    method: 'POST',
                    body: JSON.stringify({ title: noteText, body: noteText, userId: 1 }),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok.");
                } else {
                    const newPost = await response.json();
                    const noteElement = createNoteElement(newPost.title, newPost.id);
                    notesContainer.appendChild(noteElement);
                    newNoteInput.value = ''; // Clear the input box

                    // Save the new note to local storage
                    const notes = JSON.parse(localStorage.getItem('notes')) || [];
                    notes.push({ id: newPost.id, text: newPost.title });
                    localStorage.setItem('notes', JSON.stringify(notes));
                }
            } catch (error) {
                alert("Oops! Couldn't create the post.");
                console.error('Error creating post:', error);
            }
        } else {
            alert("Oops, Nothing entered!");
        }
    });

    // Load existing notes from API and local storage
    loadNotes();
});
