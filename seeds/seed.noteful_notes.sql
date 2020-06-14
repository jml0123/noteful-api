INSERT INTO noteful_notes (note_name, folder_id, content)
VALUES
('Get a carwash', 1, 'Go to get a carwash near home'),
('Buy Groceries', 1, 'Buy groceries for the week'),
('I wonder', 2, 'I wonder how mailboxes work'),
('Is this real life', 2, 'Are we in a simulation now?');



/* 



CREATE TABLE noteful_notes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    note_name TEXT NOT NULL,
    date_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    folder_id INTEGER 
        REFERENCES noteful_folders(id) ON DELETE CASCADE NOT NULL,
    content TEXT
);

*/