<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250806002636 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7E85F12B8
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE feed_entry (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, project_id INT DEFAULT NULL, code BINARY(16) NOT NULL COMMENT '(DC2Type:ulid)', created_at DATETIME NOT NULL, edited_at DATETIME NOT NULL, details JSON NOT NULL, update_type VARCHAR(255) NOT NULL, INDEX IDX_DEAECECCA76ED395 (user_id), INDEX IDX_DEAECECC166D1F9C (project_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE feed_entry ADD CONSTRAINT FK_DEAECECCA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE feed_entry ADD CONSTRAINT FK_DEAECECC166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8D8FDDAB70
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE post
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE connection DROP notify_initiating_user, DROP notify_connected_user
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA79D86650F
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_378DFDA79D86650F ON interaction
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_378DFDA7E85F12B8 ON interaction
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction ADD feed_entry_id_id INT NOT NULL, ADD user_id INT NOT NULL, DROP post_id_id, DROP user_id_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7EFD08CB2 FOREIGN KEY (feed_entry_id_id) REFERENCES feed_entry (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_378DFDA7EFD08CB2 ON interaction (feed_entry_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_378DFDA7A76ED395 ON interaction (user_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user CHANGE last_login_at last_activity_timestamp DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)'
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7EFD08CB2
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE post (id INT AUTO_INCREMENT NOT NULL, owner_id_id INT NOT NULL, created_at DATETIME NOT NULL, edited_at DATETIME NOT NULL, content LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, title VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, INDEX IDX_5A8A6C8D8FDDAB70 (owner_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8D8FDDAB70 FOREIGN KEY (owner_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE feed_entry DROP FOREIGN KEY FK_DEAECECCA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE feed_entry DROP FOREIGN KEY FK_DEAECECC166D1F9C
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE feed_entry
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user CHANGE last_activity_timestamp last_login_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_378DFDA7EFD08CB2 ON interaction
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_378DFDA7A76ED395 ON interaction
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction ADD post_id_id INT NOT NULL, ADD user_id_id INT NOT NULL, DROP feed_entry_id_id, DROP user_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA79D86650F FOREIGN KEY (user_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7E85F12B8 FOREIGN KEY (post_id_id) REFERENCES post (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_378DFDA79D86650F ON interaction (user_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_378DFDA7E85F12B8 ON interaction (post_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE connection ADD notify_initiating_user TINYINT(1) DEFAULT NULL, ADD notify_connected_user TINYINT(1) DEFAULT NULL
        SQL);
    }
}
