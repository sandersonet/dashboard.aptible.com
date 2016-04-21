import Ember from 'ember';

// Need to build a new document from scratch, even if one already exists
// Users can be added/removed at any time, so first loop over all users.
// For each user, determine if a document already exists, if so load that
// document.  If not, create a new blank document
// Return the new schema document

export default function(users, invitations, documents, schema) {
  let schemaDocument = schema.buildDocument();

  users.forEach((user) => addUserToDocument(user, documents, schemaDocument));
  invitations.forEach((invite) => addInviteToDocument(invite, documents, schemaDocument));

  return schemaDocument;
}

function addUserToDocument(user, documents, schemaDocument) {
  let { name, email } = user.getProperties('name', 'email');
  let href = user.get('data.links.self');
  let userDocument = findUserBy(documents, 'href', href) || {};
  let item = schemaDocument.addItem();

  item.set('name', name);
  item.set('email', email);
  item.set('href', href);
  item.set('hasAptibleAccount', true);

  if (userDocument) {
    ['isRobot', 'isDeveloper', 'isSecurityOfficer'].forEach((role) => {
      item.set(role, Ember.get(userDocument, role) || false);
    });
  }
}

function addInviteToDocument(invite, documents, schemaDocument) {
  let email = invite.get('email');
  let userDocument = findUserBy(documents, 'email', email) || {};
  let item = schemaDocument.addItem();

  item.set('email', email);
  item.set('hasAptibleAccount', false);

  if (userDocument) {
    ['isRobot', 'isDeveloper', 'isSecurityOfficer'].forEach((role) => {
      item.set(role, Ember.get(userDocument, role) || false);
    });
  }
}

export function findUserBy(documents, field, value) {
  return documents.find((userDocument) => {
    return Ember.get(userDocument, field) === value;
  });
}
