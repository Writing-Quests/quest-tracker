<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250622184229 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE connection (id INT AUTO_INCREMENT NOT NULL, status VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, changed_at DATETIME DEFAULT NULL, initiating_user_id INT NOT NULL, connected_user_id INT NOT NULL, notify_initiating_user TINYINT(1) DEFAULT NULL, notify_connected_user TINYINT(1) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE feed_entry (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, project_id INT DEFAULT NULL, created_at DATETIME NOT NULL, edited_at DATETIME NOT NULL, title VARCHAR(255) DEFAULT NULL, details JSON NOT NULL, update_type VARCHAR(255) NOT NULL, INDEX IDX_DEAECECCA76ED395 (user_id), INDEX IDX_DEAECECC166D1F9C (project_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE interaction (id INT AUTO_INCREMENT NOT NULL, feed_entry_id_id INT NOT NULL, user_id INT NOT NULL, content VARCHAR(255) NOT NULL, INDEX IDX_378DFDA7EFD08CB2 (feed_entry_id_id), INDEX IDX_378DFDA7A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE login_token (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, secret VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', expires_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', type VARCHAR(255) NOT NULL, payload LONGBLOB NOT NULL, INDEX IDX_594766AFA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE progress_entry (id INT AUTO_INCREMENT NOT NULL, project_id INT NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', entry_date DATETIME NOT NULL, value NUMERIC(12, 2) NOT NULL, type VARCHAR(255) NOT NULL, units VARCHAR(255) NOT NULL, INDEX IDX_C9996E4B166D1F9C (project_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE project (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, edited_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, title VARCHAR(255) DEFAULT NULL, details JSON NULL, public TINYINT(1) DEFAULT 0 NOT NULL, code BINARY(16) NOT NULL COMMENT \'(DC2Type:ulid)\', INDEX IDX_2FB3D0EEA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE project_goal (id INT AUTO_INCREMENT NOT NULL, project_id INT NOT NULL, type VARCHAR(255) NOT NULL, units VARCHAR(255) NOT NULL, goal NUMERIC(12, 2) NOT NULL, created_at DATETIME NOT NULL, edited_at DATETIME NOT NULL, start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL, progress LONGTEXT NOT NULL COMMENT \'(DC2Type:simple_array)\', code BINARY(16) NOT NULL COMMENT \'(DC2Type:ulid)\', INDEX IDX_C54D2336166D1F9C (project_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE report (id INT AUTO_INCREMENT NOT NULL, reported_by_user_id INT DEFAULT NULL, reviewed_by_user_id INT DEFAULT NULL, created_at DATETIME NOT NULL, reviewed_at DATETIME DEFAULT NULL, reported_identifier VARCHAR(255) NOT NULL, details VARCHAR(1000) DEFAULT NULL, reason VARCHAR(255) DEFAULT NULL, type VARCHAR(255) NOT NULL, code BINARY(16) NOT NULL COMMENT \'(DC2Type:ulid)\', review_action VARCHAR(1000) DEFAULT NULL, review_complete TINYINT(1) DEFAULT NULL, snapshot JSON NOT NULL, INDEX IDX_C42F7784B79DEF28 (reported_by_user_id), INDEX IDX_C42F7784E03A844A (reviewed_by_user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, username VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, unverified_email VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', edited_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', email_verified_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', last_activity_timestamp DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', description TEXT DEFAULT NULL, link VARCHAR(255) DEFAULT NULL, timezone DATETIME NOT NULL, public TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_IDENTIFIER_USERNAME (username), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE feed_entry ADD CONSTRAINT FK_DEAECECCA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE feed_entry ADD CONSTRAINT FK_DEAECECC166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7EFD08CB2 FOREIGN KEY (feed_entry_id_id) REFERENCES feed_entry (id)');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE login_token ADD CONSTRAINT FK_594766AFA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE progress_entry ADD CONSTRAINT FK_C9996E4B166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE project_goal ADD CONSTRAINT FK_C54D2336166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784B79DEF28 FOREIGN KEY (reported_by_user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784E03A844A FOREIGN KEY (reviewed_by_user_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE feed_entry DROP FOREIGN KEY FK_DEAECECCA76ED395');
        $this->addSql('ALTER TABLE feed_entry DROP FOREIGN KEY FK_DEAECECC166D1F9C');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7EFD08CB2');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7A76ED395');
        $this->addSql('ALTER TABLE login_token DROP FOREIGN KEY FK_594766AFA76ED395');
        $this->addSql('ALTER TABLE progress_entry DROP FOREIGN KEY FK_C9996E4B166D1F9C');
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EEA76ED395');
        $this->addSql('ALTER TABLE project_goal DROP FOREIGN KEY FK_C54D2336166D1F9C');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784B79DEF28');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784E03A844A');
        $this->addSql('DROP TABLE connection');
        $this->addSql('DROP TABLE feed_entry');
        $this->addSql('DROP TABLE interaction');
        $this->addSql('DROP TABLE login_token');
        $this->addSql('DROP TABLE progress_entry');
        $this->addSql('DROP TABLE project');
        $this->addSql('DROP TABLE project_goal');
        $this->addSql('DROP TABLE report');
        $this->addSql('DROP TABLE user');
    }
}
