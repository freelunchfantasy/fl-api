import sgMail from '@sendgrid/mail';

export default class SendgridHelper {
  constructor() {
    const SENDGRID_API_KEY = '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';
    sgMail.setApiKey(SENDGRID_API_KEY);
  }

  sendTradeSimulationResultEmail(inputs) {
    const msg = {
      to: inputs.target_email,
      from: 'freelunchfantasy@gmail.com',
      templateId: 'd-f01d754baaba4f2684d074a0e51aea88',
      dynamicTemplateData: {
        target_email: inputs.target_email,
        sender_name: inputs.sender_name,
        league_name: inputs.league_name,
        left_team_name: inputs.left_team_name,
        right_team_name: inputs.right_team_name,
        left_players: inputs.left_players,
        right_players: inputs.right_players,
        left_win_diff_positive: inputs.left_win_diff_positive,
        left_win_diff: inputs.left_win_diff,
        right_win_diff_positive: inputs.right_win_diff_positive,
        right_win_diff: inputs.right_win_diff,
      },
    };

    sgMail
      .send(msg)
      .then(response => {
        console.log(response[0].statusCode);
        console.log(response[0].headers);
      })
      .catch(err => {
        console.log(err);
      });
  }

  sendFeedbackMessageEmail(inputs) {
    console.log('HEYYYYYYYYYYYYYYYYYYYY');
    console.log(inputs.sender_email);
    const msg = {
      to: 'freelunchfantasy@gmail.com',
      from: 'freelunchfantasy@gmail.com',
      templateId: 'd-14e9546048ab412d8aab8bba4b2f4631',
      dynamicTemplateData: {
        sender_email: inputs.sender_email,
        sender_name: inputs.sender_name,
        message: inputs.message,
        date_submitted: inputs.date_submitted,
      },
    };

    sgMail
      .send(msg)
      .then(response => {
        console.log(response[0].statusCode);
        console.log(response[0].headers);
      })
      .catch(err => {
        console.log(err);
      });
  }
}
